import {define} from 'trans-render/define.js';
import {hydrate} from 'trans-render/hydrate.js';
import {XtallatX} from 'xtal-element/xtal-latx.js';
import {observeCssSelector} from 'xtal-element/observeCssSelector.js';

const selector = 'selector';
const observe = 'observe';
const clone = 'clone';

/**
 * @element css-observe
 * @event latest-match-changed - Fires when css match is found.
 */
export class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))){
    static get is(){return 'css-observe';}
    static get observedAttributes(){
        return super.observedAttributes.concat([observe, selector, clone]);
    }
    _connected!: boolean;
    connectedCallback(){
        this.style.display='none';
        this.propUp([selector, observe]);
        this._connected = true;
        this.onPropsChange();
    }
    _selector!: string;
    get selector(){
        return this._selector;
    }
    /**
     * CSS selector to monitor for.
     * @attr
     */
    set selector(val){
        this.attr(selector, val)
    }

    _observe!: boolean;
    get observe(){
        return this._observe;
    }
    /**
     * This attribute/property must be present/true for anything to happen.
     * @attr
     */
    set observe(val){
        this.attr(observe, val, '');
    }

    _clone = false;
    get clone(){
        return this._clone;
    }
    /**
     * Clone template inside when css match is found.
     * @attr
     */
    set clone(nv){
        this.attr(clone, nv, '');
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string){
        super.attributeChangedCallback(name, oldVal, newVal);
        const fldName = '_' + name;
        switch(name){
            case selector:
                (<any>this)[fldName] = newVal;
                break;
            case clone:
            case observe:
                (<any>this)[fldName] = newVal !== null;
                break;
        }
        this.onPropsChange();
    }

    onPropsChange(){
        // if(this._connected && !this.id){
        //     console.warn('id required for ' + this.localName);
        // }
        if(this._disabled || !this._connected || !this._observe) return;
        if(this.id === '') {
            this.id = CssObserve.is + (new Date()).valueOf();
        }
        this.addCSSListener(this.id, this._selector, this.insertListener);
    }

    _latestMatch!: Element;
    get latestMatch(){
        return this._latestMatch;
    }
    set latestMatch(val){
        this._latestMatch = val;
        this.de('latest-match', {
            value: val,
        });
        if(this._clone){
            const templ = this.querySelector('template');
            const parent = this.parentElement;
            if(templ !== null && parent !== null){
                parent.appendChild(templ.content.cloneNode(true));
            }
        }
    }
    insertListener(e: any){
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() =>{
                this.latestMatch = target;
            }, 0)
            
        }
    }
}

define(CssObserve);