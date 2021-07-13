import {
    loadEventPoliciesSuccess,
    loadEventCommentsInProgress,
    loadEventCommentsSuccess,
    loadEventCommentsFailure,
    saveCommentInProgress,
    saveCommentDone,
    saveCommentReplyInProgress,
    saveCommentReplyDone,
} from '../actions/eventDetailsActions';
import {addNotification} from "./notificationThunks";
import axios from "axios";
import {NOTIFICATION_CONTEXT} from "../configs/wizardConfig";

// prepare http headers for posting to resources
const getHttpHeaders = () => {
    return {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
    };
}

export const saveAccessPolicies = (eventId, policies) => async (dispatch) => {

    let headers = getHttpHeaders();

    let data = new URLSearchParams();
    data.append("acl", JSON.stringify(
        {
            acl: {
                ace: policies
            }
        })
    );
    data.append("override", true);

    return axios.post(`admin-ng/event/${eventId}/access`, data.toString(), headers)
        .then(response => {
            console.log(response);
            dispatch(addNotification('info', 'SAVED_ACL_RULES', 5, null, NOTIFICATION_CONTEXT));
            return true;
        })
        .catch(response => {
            console.log(response);
            dispatch(addNotification('error', 'ACL_NOT_SAVED', 5, null, NOTIFICATION_CONTEXT));
            return false;
        });
}

export const fetchAccessPolicies = (eventId) => async (dispatch) => {
    try {
        const policyData = await axios.get(`admin-ng/event/${eventId}/access.json`);
        let policies = await policyData.data;

        dispatch(loadEventPoliciesSuccess(policies));
    } catch (e) {
        console.log(e);
    }
}

export const fetchHasActiveTransactions = (eventId) => async (dispatch) => {
    try {
        const transactionsData = await axios.get(`admin-ng/event/${eventId}/hasActiveTransaction`);
        const hasActiveTransactions = await transactionsData.data;
        return hasActiveTransactions;
    } catch (e) {
        console.log(e);
    }
}

export const fetchComments = (eventId) => async (dispatch) => {
    try {
        dispatch(loadEventCommentsInProgress());

        const commentsData = await axios.get(`admin-ng/event/${eventId}/comments`);
        const comments = await commentsData.data;

        const commentReasonsData = await axios.get(`admin-ng/resources/components.json`);
        const commentReasons = (await commentReasonsData.data).eventCommentReasons;

        dispatch(loadEventCommentsSuccess(comments, commentReasons));
    } catch (e) {
        dispatch(loadEventCommentsFailure());
        console.log(e);
    }
}

export const saveComment = (eventId, commentText, commentReason) => async (dispatch) => {
    try {
        dispatch(saveCommentInProgress());

        let headers = getHttpHeaders();

        let data = new URLSearchParams();
        data.append("text", commentText);
        data.append("reason", commentReason);

        const commentSaved = await axios.post(`admin-ng/event/${eventId}/comment`,
            data.toString(), headers );
        await commentSaved.data;

        dispatch(saveCommentDone());
        return true;
    } catch (e) {
        dispatch(saveCommentDone());
        console.log(e);
        return false;
    }
}

export const deleteComment = (eventId, commentId) => async () => {
    try {
        const commentDeleted = await axios.delete(`admin-ng/event/${eventId}/comment/${commentId}`);
        await commentDeleted.data;
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const saveCommentReply = (eventId, commentId, replyText, commentResolved) => async (dispatch) => {
    try {
        dispatch(saveCommentReplyInProgress());

        let headers = getHttpHeaders();

        let data = new URLSearchParams();
        data.append("text", replyText);
        data.append("resolved", commentResolved);

        const commentReply = await axios.post(`admin-ng/event/${eventId}/comment/${commentId}/reply`,
            data.toString(), headers );

        await commentReply.data;

        dispatch(saveCommentReplyDone());
        return true;
    } catch (e) {
        dispatch(saveCommentReplyDone());
        console.log(e);
        return false;
    }
}

export const deleteCommentReply = (eventId, commentId, replyId) => async () => {
    try {
        const commentReplyDeleted = await axios.delete(`admin-ng/event/${eventId}/comment/${commentId}/${replyId}`);
        await commentReplyDeleted.data;

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
