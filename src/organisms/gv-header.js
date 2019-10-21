import { LitElement, html, css } from 'lit-element';
import { link } from '../styles/link';
import '../molecules/gv-nav';

/**
 * A header
 *
 * @fires gv-nav:change - Custom event when nav link change
 *
 * @attr {String} logoHref - href of logo link
 * @attr {String} logoImg - source of image
 * @attr {String} logoImgAlt - alt text of image
 * @attr {String} logoTitle - title of logo link
 * @attr {Array} routes - definition of routes [{path: String, selected: Boolean, title: String}]
 *
 */
export class GvHeader extends LitElement {

  static get properties () {
    return {
      logoHref: { type: String },
      logoImg: { type: String },
      logoImgAlt: { type: String },
      logoTitle: { type: String },
      routes: { type: Array, attribute: false },
    };
  }

  static get styles () {
    return [
      link,
      // language=css
      css`
          header {
              display: table;
              padding: 1rem 4rem;
              width: 100%;
          }

          .logo {
              display: table-cell;
              vertical-align: middle;
              width: 20%;
          }

          .logo img {
              height: 3rem;
              width: 3rem;
              display: inline-block;
              max-width: 100%;
              border-style: none;
          }

          gv-nav {
              display: table-cell;
              vertical-align: middle;
              width: 80%;
          }
      `,
    ];
  }

  constructor () {
    super();
    this.logoImgAlt = this.logoTitle;
    this.logoHref = '';
  }

  render () {

    const mainNav = document.createElement('gv-nav');
    mainNav.routes = this.routes;

    return html`
      <header>
        
        <a href="${this.logoHref}" target="_blank" class="logo link" title="${this.logoTitle}">
             <img src="${this.logoImg}" alt="${this.logoImgAlt}">
        </a>
        
        ${mainNav}
    
      </header>
    `;
  }

}

window.customElements.define('gv-header', GvHeader);