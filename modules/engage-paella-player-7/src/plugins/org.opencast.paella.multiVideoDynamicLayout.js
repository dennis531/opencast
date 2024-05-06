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

import { VideoLayout, CanvasButtonPosition } from 'paella-core';

import defaultIconMaximize from '../icons/maximize.svg';
import defaultIconMinimize from '../icons/minimize.svg';

export default class MultiVideoDynamicLayout extends VideoLayout {
  get identifier() {
    return 'multiple-video-dynamic';
  }

  get layoutType() {
    return 'dynamic';
  }

  async load() {
    this.player.log.debug('Multi video layout loaded');
  }

  getValidStreams(streamData) {
    // Ignore content of streamData
    return [streamData];
  }

  getValidContentIds() {
    // Ignore content of streamData
    return this.validContentIds;
  }

  getVideoCanvasButtons(layoutStructure, content) {
    const iconMaximize = this.player.getCustomPluginIcon(this.name,'iconMaximize') || defaultIconMaximize;
    const iconMinimize = this.player.getCustomPluginIcon(this.name,'iconMinimize') || defaultIconMinimize;
    const layoutData = () => this._currentVideos.find(lo => lo.content === content);
    const isMaximized = () => layoutData().size > 50;
    const buttons = [];

    if (this._currentVideos.length > 1) {
      if (!isMaximized()) {
        buttons.push({
          icon: iconMaximize,
          position: CanvasButtonPosition.LEFT,
          title: this.player.translate('Maximize video'),
          ariaLabel: this.player.translate('Maximize video'),
          name: this.name + ':iconMaximize',
          click: async () => {
            this._currentVideos.forEach(lo => {
              lo.size = lo.content === content ? 75 : 25 / (this._currentVideos.length - 1);
            });
            await this.player.videoContainer.updateLayout();
          }
        });
      } else {
        buttons.push({
          icon: iconMinimize,
          position: CanvasButtonPosition.LEFT,
          title: this.player.translate('Minimize video'),
          ariaLabel: this.player.translate('Minimize video'),
          name: this.name + ':iconMinimize',
          click: async () => {
            this._currentVideos.forEach(lo => {
              lo.size = 100 / this._currentVideos.length;
            });
            await this.player.videoContainer.updateLayout();
          }
        });
      }
    }

    return buttons;
  }

  getLayoutStructure(streamData) {
    if (!this._currentVideos) {
      const size = 100 / streamData.length;
      this._currentVideos = streamData.map(d => {
        return {
          content: d.content,
          visible: true,
          size: size,
        };
      });
    }

    return {
      hidden: false,
      videos: this._currentVideos
    };
  }
}
