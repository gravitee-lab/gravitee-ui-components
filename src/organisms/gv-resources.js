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
import { css, html, LitElement } from 'lit-element';

import './gv-schema-form';
import './gv-resizable-views';
import './gv-documentation';
import '../molecules/gv-table';
import '../atoms/gv-button';
import '../molecules/gv-option';
import '../atoms/gv-switch';
import '../atoms/gv-icon';
import { dispatchCustomEvent } from '../lib/events';
import { uuid } from '../lib/studio';
import { KeyboardElement, KEYS } from '../mixins/keyboard-element';

export class GvResources extends KeyboardElement(LitElement) {

  static get properties () {
    return {
      resources: { type: Array },
      _resources: { type: Array, attribute: false },
      types: { type: Array },
      documentation: { type: Object },
      _currentResource: { type: Object, attribute: false },
      _filter: { type: String },
    };
  }

  constructor () {
    super();
    this.resources = [];
    this.types = [];
    this._currentResource = null;
    this._emptymessage = 'No resource';
  }

  onKeyboard () {
    if (this.isPressed(KEYS.Esc)) {
      this._onCancelResourceForm();
    }
    if (this.isPressed(KEYS.Shift, KEYS.Ctrl, KEYS.Space)) {
      const search = this.shadowRoot.querySelector('#search-resource');
      if (search) {
        search.focus();
      }
    }
  }

  firstUpdated () {
    const views = this.shadowRoot.querySelector('gv-resizable-views');
    if (views != null) {
      views.updateComplete.then(() => {
        this._maximizeTopView();
      });
    }
  }

  set resources (resources) {
    this._resources = this._generateId(resources);
  }

  get resources () {
    return this._resources;
  }

  _generateId (list) {
    if (list) {
      return list.map((e) => {
        if (e._id == null) {
          e._id = uuid();
        }
        return e;
      });
    }
    return list;
  }

  _getResizableViews () {
    return this.shadowRoot.querySelector('gv-resizable-views');
  }

  _maximizeTopView () {
    this._getResizableViews().resize(60, 40);
  }

  _maximizeBottomView () {
    this._getResizableViews().maximizeBottom();
  }

  _splitMainViews () {
    this._getResizableViews().split();
  }

  _onCancelResourceForm () {
    this._currentResource = null;
    this.documentation = null;
    this._maximizeTopView();
  }

  _removeResource (item) {
    this.resources = this.resources.filter((resource) => resource._id !== item._id);
    this._onCancelResourceForm();
    dispatchCustomEvent(this, 'change', { resources: this.resources });
  }

  _buildResourceSchema (resourceType) {
    const defaultSchema = {
      properties: {
        name: {
          type: 'string',
          title: 'Resource name',
        },
      },
      required: ['type', 'name'],
    };

    const schema = typeof resourceType.schema === 'string' ? JSON.parse(resourceType.schema) : resourceType.schema;

    return {
      properties: { ...defaultSchema.properties, ...schema.properties },
      required: [...defaultSchema.required, ...schema.required],
    };
  }

  _onCreateResource ({ detail }) {
    const defaultResourceType = this.types.find((type) => type.id === detail.id);
    const schema = this._buildResourceSchema(defaultResourceType);

    this._currentResource = {
      type: defaultResourceType.id,
      title: 'Create resource',
      icon: 'code:plus',
      schema,
      values: {},
      submitLabel: 'Add',
    };
    this._maximizeBottomView();
    this._onFetchDocumentation();
  }

  _onSubmitResourceForm ({ detail }) {
    const { type } = this._currentResource;
    const { _id, name, ...configuration } = detail.values;

    const resource = {
      _id,
      type,
      name,
      configuration,
    };

    if (detail.values._id != null) {
      let index = -1;
      this.resources.find((r, i) => {
        if (r._id === resource._id) {
          index = i;
        }
      });
      this.resources[index] = { ...this.resources[index], ...resource };
    }
    else {
      if (this.resources == null) {
        this.resources = [];
      }
      resource._id = uuid();
      resource.enabled = true;
      this.resources.push(resource);
    }
    this._onCancelResourceForm();
    dispatchCustomEvent(this, 'change', { resources: this.resources });
  }

  _onChangeResourceForm ({ detail }) {
    if (detail.values.type && this._currentResource.type !== detail.values.type) {
      this._currentResource.type = detail.values.type;
      const resourceType = this._findResourceById(this._currentResource.type);
      this._currentResource.schema = this._buildResourceSchema(resourceType);
      this._onFetchDocumentation();
    }
  }

  _findResourceById (id) {
    return this.types.find((resource) => resource.id === id);
  }

  _onEditResource (resource) {
    const values = { ...resource, ...resource.configuration };
    delete values.configuration;
    const resourceType = this._findResourceById(resource.type);
    this._currentResource = {
      _id: resource._id,
      title: 'Edit resource',
      type: resource.type,
      icon: 'design:edit',
      schema: this._buildResourceSchema(resourceType),
      values,
      submitLabel: 'Update',
    };
    this._splitMainViews();
    this._onFetchDocumentation();
  }

  _onCloseDocumentation () {
    this.documentation = null;
  }

  _getCurrentResourceType () {
    return this._currentResource ? this._findResourceById(this._currentResource.type) : null;
  }

  _onFetchDocumentation () {
    dispatchCustomEvent(this, 'fetch-documentation', { resourceType: this._getCurrentResourceType() });
  }

  _onChangeResourceState (item, event) {
    let index = null;
    this.resources.find((r, i) => {
      if (r._id === item._id) {
        index = i;
      }
    });
    this.resources[index] = { ...this.resources[index], enabled: item.enabled };
    dispatchCustomEvent(this, 'change', { resources: this.resources });
  }

  _renderForm () {
    return html`<gv-schema-form .schema="${this._currentResource.schema}"
                                .values="${this._currentResource.values}" 
                                submitLabel="${this._currentResource.submitLabel}"
                                 has-header
                                .icon="${this._currentResource.icon}"
                                @gv-schema-form:change="${this._onChangeResourceForm}"
                                @gv-schema-form:submit="${this._onSubmitResourceForm}">
                  <div slot="title" class="form-title">${this._currentResource.title}</div>
                  <gv-button slot="header-left" icon="general:close" outlined small @gv-button:click="${this._onCancelResourceForm}" title="Close (esc)"></gv-button>
                  <gv-button slot="header-left" icon="home:book" ?disabled="${this.documentation != null}" outlined small @gv-button:click="${this._onFetchDocumentation}" title="Open documentation"></gv-button>
                </gv-schema-form>`;
  }

  _renderDoc () {
    return html`<gv-documentation .text="${this.documentation.content}" .image="${this.documentation.image}" @gv-documentation:close="${this._onCloseDocumentation}"></gv-documentation>`;
  }

  _renderBottom () {
    if (this.documentation && this._currentResource) {
      return html` <gv-resizable-views direction="horizontal" no-overflow>
                      <div slot="top">${this._renderForm()}</div>
                      <div slot="bottom">
                        ${this._renderDoc()}
                      </div>
                   </gv-resizable-views>`;
    }
    else if (this._currentResource) {
      return this._renderForm();
    }
    else if (this.documentation) {
      return this._renderDoc();
    }
    else {

      const resourceOpts = this.types.map((resource) => {
        return { id: resource.id, title: resource.name, description: resource.description, image: resource.icon };
      });

      return html`<div class="resources-bottom-container">
                        <gv-option .options="${resourceOpts}" @gv-option:select="${this._onCreateResource}">
                  </div>`;
    }
  }

  _onSearchResource ({ detail }) {
    this._filter = detail;
  }

  _onClearResource () {
    this._filter = null;
  }

  render () {
    const options = {
      data: [

        { field: 'name', label: 'Name', type: 'gv-input', attributes: { clipboard: true } },
        {
          field: 'type',
          width: '50px',
          type: 'gv-image',
          attributes: {
            src: (item) => {
              const resourceType = this._findResourceById(item.type);
              return resourceType ? resourceType.icon : null;
            },
            style: 'width:40px;height:40px;',
          },
        },
        { field: 'type', label: 'Type' },
        {
          field: 'enabled',
          type: 'gv-switch',
          title: (item) => item.enabled ? 'Click to disable' : 'Click to enable',
          width: '50px',
          attributes: {
            'ongv-switch:input': (item, event) => this._onChangeResourceState(item, event),
          },
        },
        {
          type: 'gv-button',
          width: '40px',
          attributes: {
            onClick: (item) => this._onEditResource(item),
            title: (item) => this._currentResource && this._currentResource._id === item._id ? 'Editing' : 'Edit',
            outlined: true,
            icon: 'design:edit',
            disabled: (item) => this._currentResource && this._currentResource._id === item._id,
          },
        },
        {
          type: 'gv-button',
          width: '40px',
          attributes: {
            onClick: (item) => this._removeResource(item),
            title: 'remove',
            danger: true,
            outlined: true,
            icon: 'home:trash',
          },
        },
      ],
    };

    const filteredResources = this._filter != null ? this.resources.filter((resource) => {
      return (resource.name.toLowerCase() + resource.type.toLowerCase()).includes(this._filter);
    }) : this.resources;

    return html`<div class="resources">
                  <gv-resizable-views no-overflow>
                    <div slot="top" class="box">
                      <div class="container">
                        <div class="header">
                          <div class="title">
                            Manage global resources <span>(${this.resources.length})</span>
                          </div>
                          <gv-input id="search-resource" class="search-input" placeholder="Filter resources (Shift + Ctrl + Space)" type="search" small 
                                    @gv-input:input="${this._onSearchResource}" 
                                    @gv-input:clear="${this._onClearResource}"></gv-input>
                        </div>
                        <div class="content">
                          <div class="table-container">
                            <gv-table .options="${options}"
                                .items="${filteredResources}"
                                emptymessage="${this._emptymessage}"
                                order="name"
                                rowheight="50px"></gv-table>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div slot="bottom">${this._renderBottom()}</div>
                  </gv-resizable-views>
                </div>`;
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          box-sizing: border-box;
          height: 100%;
          width: 100%;
          display: block;
        }

        .resources {
          display: flex;
          height: 100%;
          width: 100%;
        }

        gv-resizable-views {
          height: 100%;
          width: 100%;
        }

        .header {
          border-bottom: 1px solid #D9D9D9;
          display: flex;
          min-height: 45px;
          align-items: center;
          margin-bottom: .5rem;
          padding: 0 .5rem;
        }

        .header .title {
          color: #28444F;
          font-size: 18px;
          display: flex;
          align-items: flex-end;
          flex: 1;
        }

        .header .title span {
          font-size: 12px;
          margin-left: 8px;
          opacity: 0.7;
        }

        .box {
          position: absolute;
          display: flex;
          flex-direction: column;
          width: 100%;
          top: 0;
          bottom: 0;
          left: 0;
        }

        .container {
          flex-grow: 1;

          display: flex;
          flex-direction: column;

          /* for Firefox */
          min-height: 0;
          height: 100%;
        }

        .content {
          background: white;
          flex-grow: 1;

          overflow: auto;

          /* for Firefox */
          min-height: 0;
          padding: 0.5rem;

          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .form-title {
          text-transform: uppercase;
          letter-spacing: 0.2rem;
        }

        .resources-bottom-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .table-container {
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .search-input {
          width: 300px;
        }
      `,
    ];
  }

}

window.customElements.define('gv-resources', GvResources);
