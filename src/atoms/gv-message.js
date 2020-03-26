/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { classMap } from 'lit-html/directives/class-map';
import { LitElement, html, css } from 'lit-element';

/**
 * @attr {String} type - type of the message. Can be info (Default), success, error, warning or info.
 *
 * @cssprop {Color} [--gv-message-success--bgc=var(--gv-theme-color-light, #D5FDCB)] - Success background color
 * @cssprop {Color} [--gv-message-success--c=var(--gv-theme-color-darker, #1D3730)] - Success color
 * @cssprop {Color} [--gv-message-info--c=#00529B] - Info color
 * @cssprop {Color} [--gv-message-info--bgc=#BDE5F8] - Info background color
 * @cssprop {Color} [--gv-message-warn--c=#9F6000] - Warning color
 * @cssprop {Color} [--gv-message-warn--bgc=#FEEFB3] - Warning background color
 * @cssprop {Color} [--gv-message-error--c=#820014] - Error color
 * @cssprop {Color} [--gv-message-error--bgc=#FFCCC7] - Error background color
*/
export class GvMessage extends LitElement {

  static get properties () {
    return {
      type: { type: String },
    };
  }

  static get styles () {
    return [
      // language=CSS
      css`
          :host {
            display: block;
            vertical-align: middle;
          }

          div {
              font-style: normal;
              font-weight: normal;
              line-height: normal;
              padding: 12px 0px;
              position: absolute;
              text-align: center;
              width: 100%;
          }

          div.info {
            background-color: var(--gv-message-info--bgc, #BDE5F8);
            color: var(--gv-message-info--c, #00529B);
          }

          div.success {
            background-color: var(--gv-message-success--bgc, var(--gv-theme-color-light, #D5FDCB));
            color: var(--gv-message-success--c, var(--gv-theme-color-darker, #1D3730));
          }

          div.warning {
            background-color: var(--gv-message-warn--bgc, #FEEFB3);
            color: var(--gv-message-warn--c, #9F6000);
          }

          div.error {
            background-color: var(--gv-message-error--bgc, #FFCCC7);
            color: var(--gv-message-error--c, #820014);
          }
      `,
    ];
  }

  render () {
    const modes = {
      info: (!this.type || (this.type !== 'success' && this.type !== 'error' && this.type !== 'warning')),
      warning: (this.type === 'warning'),
      success: (this.type === 'success'),
      error: (this.type === 'error'),
    };
    return html`
      <div class=${classMap(modes)}>
        <slot></slot>
      </div>
    `;
  }
}

window.customElements.define('gv-message', GvMessage);
