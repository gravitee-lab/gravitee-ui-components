import{LitElement as t,html as e}from"lit-element";import{dispatchCustomEvent as i}from"../lib/events";import{repeat as r}from"lit-html/directives/repeat";export class GvMainNav extends t{static get properties(){return{links:{type:Array,attribute:!1}}}t({target:{title:t}}){this.links=this.links.map(e=>(e.selected=e.title===t,e)),i(this,"change",this.links)}render(){return e`<nav>${r(this.links,({title:t})=>t,({href:t,title:i,selected:r})=>e`<gv-nav-link @click="${this.t}" href="${t}" title="${i}" ?selected="${r}">${i}</gv-nav-link>`)}</nav>`}}window.customElements.define("gv-main-nav",GvMainNav);
//# sourceMappingURL=gv-main-nav.js.map