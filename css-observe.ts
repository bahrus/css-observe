import {define} from 'xtal-latx/define.js';
import {XtallatX} from 'xtal-latx/xtal-latx.js';
import {observeCssSelector} from 'xtal-latx/observeCssSelector.js';

const selector = 'selector';
const observe = 'observe';

export class CssObserve extends observeCssSelector(XtallatX(HTMLElement)){
    static get is(){return 'css-observe';}
    static get observedAttributes(){
        return super.observedAttributes.concat([observe, selector]);
    }
    _connected!: boolean;
    connectedCallback(){
        this._upgradeProperties([selector, observe]);
        this._connected = true;
        this.onPropsChange();
    }
    _selector!: string;
    get selector(){
        return this._selector;
    }
    set selector(val){
        this.attr(selector, val)
    }

    _observe!: boolean;
    get observe(){
        return this._observe;
    }
    set observe(val){
        this.attr(observe, val, '');
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string){
        super.attributeChangedCallback(name, oldVal, newVal);
        const fldName = '_' + name;
        switch(name){
            case selector:
                this[fldName] = newVal;
                break;
            case observe:
                this[fldName] = newVal !== null;
                break;
        }
        this.onPropsChange();
    }

    onPropsChange(){
        if(this._connected && !this.id){
            console.warn('id required for ' + this.localName);
        }
        if(this._disabled || !this._connected || !this._observe || !this.id) return;
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
    }
    insertListener(e: any){
        if (e.animationName === this.id) {
            this.latestMatch = e.target;
        }
    }
}

define(CssObserve);