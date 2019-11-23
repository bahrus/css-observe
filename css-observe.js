import { define } from 'trans-render/define.js';
import { hydrate } from 'trans-render/hydrate.js';
import { XtallatX } from 'xtal-element/xtal-latx.js';
import { observeCssSelector } from 'xtal-element/observeCssSelector.js';
const selector = 'selector';
const observe = 'observe';
const clone = 'clone';
/**
 * @element css-observe
 */
export class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
    constructor() {
        super(...arguments);
        this._clone = false;
    }
    static get is() { return 'css-observe'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([observe, selector, clone]);
    }
    connectedCallback() {
        this.style.display = 'none';
        this.propUp([selector, observe]);
        this._connected = true;
        this.onPropsChange();
    }
    get selector() {
        return this._selector;
    }
    /**
     * CSS selector to monitor for.
     * @attr
     */
    set selector(val) {
        this.attr(selector, val);
    }
    get observe() {
        return this._observe;
    }
    /**
     * This attribute/property must be present/true for anything to happen.
     * @attr
     */
    set observe(val) {
        this.attr(observe, val, '');
    }
    get clone() {
        return this._clone;
    }
    set clone(nv) {
        this.attr(clone, nv, '');
    }
    attributeChangedCallback(name, oldVal, newVal) {
        super.attributeChangedCallback(name, oldVal, newVal);
        const fldName = '_' + name;
        switch (name) {
            case selector:
                this[fldName] = newVal;
                break;
            case clone:
            case observe:
                this[fldName] = newVal !== null;
                break;
        }
        this.onPropsChange();
    }
    onPropsChange() {
        // if(this._connected && !this.id){
        //     console.warn('id required for ' + this.localName);
        // }
        if (this._disabled || !this._connected || !this._observe)
            return;
        if (this.id === '') {
            this.id = CssObserve.is + (new Date()).valueOf();
        }
        this.addCSSListener(this.id, this._selector, this.insertListener);
    }
    get latestMatch() {
        return this._latestMatch;
    }
    set latestMatch(val) {
        this._latestMatch = val;
        this.de('latest-match', {
            value: val,
        });
        if (this._clone) {
            const templ = this.querySelector('template');
            const parent = this.parentElement;
            if (templ !== null && parent !== null) {
                parent.appendChild(templ.content.cloneNode(true));
            }
        }
    }
    insertListener(e) {
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() => {
                this.latestMatch = target;
            }, 0);
        }
    }
}
define(CssObserve);
