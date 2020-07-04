import {hydrate} from 'trans-render/hydrate.js';
import {XtallatX, define} from 'xtal-element/xtal-latx.js';
import {observeCssSelector} from 'xtal-element/observeCssSelector.js';
import {AttributeProps} from 'xtal-element/types.d.js';

const linkInsertListener = ({disabled, observe, selector, self, customStyles}: CssObserve) =>{
    self.disconnect();
    if(disabled || !observe || !self.isConnected || selector === undefined) return;
    if(self.id === ''){
        self.id = CssObserve.is + (new Date()).valueOf();
    }
    self.addCSSListener(self.id, selector, self.insertListener, customStyles);
}
const linkClonedTemplate = ({disabled, clone, latestMatch, sym, self}: CssObserve) =>{
    if(disabled || !clone) return;
    const templ = self.querySelector('template');
    const parent = self.parentElement;
    if(parent !== null && (!(<any>parent)[sym]) && templ !== null) {
        parent.appendChild(templ.content.cloneNode(true));
        (<any>parent)[sym] = true;
    }
}

/**
 * @element css-observe
 * @event latest-match-changed - Fires when css match is found.
 */
export class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))){
    static is = 'css-observe';
    static attributeProps = ({observe, selector, clone, disabled, customStyles, latestMatch}: CssObserve) =>({
        bool: [observe, disabled, clone],
        obj: [latestMatch],
        notify: [latestMatch],
        str: [selector, customStyles],
        reflect: [observe, disabled, clone, selector]
    } as AttributeProps);

    sym = Symbol();

    connectedCallback(){
        this.style.display='none';
        super.connectedCallback();
    }

    /**
     * CSS selector to monitor for.
     * @attr
     */
    selector!: string;

    /**
     * This attribute/property must be present/true for anything to happen.
     * @attr
     */
    observe!: boolean;
        
    /**
     * Clone template inside when css match is found.
     * @attr
     */
    clone!:  boolean;

    customStyles = '';

    propActions = [
        linkInsertListener,
        linkClonedTemplate
    ]


    latestMatch!: Element;

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