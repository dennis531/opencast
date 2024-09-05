/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 *
 * The Apereo Foundation licenses this file to you under the Educational
 * Community License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License
 * at:
 *
 *   http://opensource.org/licenses/ecl2.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */

import { getUrlFromOpencastServer } from './PaellaOpencast';

export default class OpencastAuth {
  constructor(player) {
    this.player = player;
  }

  async getUserInfo() {
    try {
      const response = await fetch(getUrlFromOpencastServer('/info/me.json'));
      if (response.ok) {
        return await response.json();
      }
      return null;
    }
    catch(_e) {
      return null;
    }
  }

  async getEpisodeACL() {
    try {
      const response = await fetch(getUrlFromOpencastServer(`/search/episode.json?id=${this.player.videoId}`));
      if (response.ok) {
        const episode = await response.json();
        return episode['result'][0]?.acl;
      }
      return null;
    }
    catch(_e) {
      return null;
    }
  }

  async getSeriesACL() {
    try {
      const { series } = this.player.videoManifest.metadata;
      if (!series) {
        return null;
      }
      const response = await fetch(getUrlFromOpencastServer(`/series/${series}/acl.json`));
      if (response.ok) {
        return await response.json();
      }
      return null;
    }
    catch(_e) {
      return null;
    }
  }

  async getACL() {
    return await this.getEpisodeACL() || await this.getSeriesACL();
  }

  async canWrite() {
    try {
      const userInfo = await this.getUserInfo();
      let acl = await this.getACL();
      acl = acl?.acl ? acl.acl : acl;
      if (!userInfo || !acl) {
        return false;
      }

      let roles = userInfo.roles;
      if (!(roles instanceof Array)) { roles = [roles]; }

      let canWrite = false;
      if (acl) {
        if (!(acl instanceof Array)) { acl = [acl]; }

        canWrite = roles.some(function(currentRole) {
          if (currentRole == userInfo.org.adminRole) {
            return true;
          }
          else {
            return acl.some(function(currentAce) {
              if (currentRole == currentAce.role) {
                if (currentAce.action == 'write') {
                  return true;
                }
              }
              return false;
            });
          }
        });
      }
      return canWrite;
    }
    catch(_e) {
      return false;
    }
  }
}
