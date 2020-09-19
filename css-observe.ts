import {hydrate} from 'trans-render/hydrate.js';
import {XtallatX, define} from 'xtal-element/xtal-latx.js';
import {observeCssSelector} from 'xtal-element/observeCssSelector.js';
import {AttributeProps} from 'xtal-element/types.d.js';
import {ICssObserve} from './types.d.js';
export {ICssObserve as ICSSObserve} from './types.d.js';

const linkInsertListener = ({disabled, observe, selector, self, customStyles}: CssObserve) =>{
    self.disconnect();
    if(disabled || !observe || !self.isConnected || selector === undefined) return;
    if(self.id === ''){
        self.id = CssObserve.is + (new Date()).valueOf();
    }
    self.addCSSListener(self.id, selector, self.insertListener, customStyles);
}
const linkClosestContainer = ({withinClosest, self}: CssObserve) =>{
    if(withinClosest === undefined){
        delete self.closestContainer;
    }else{
        self.closestContainer = self.closest(withinClosest);
        if(self.closestContainer === null){
            console.warn("Could not locate closest container.");
        }
    }
}
const linkLatestMatch = ({latestOuterMatch, closestContainer, self}: CssObserve) => {
    if(latestOuterMatch === undefined) return;
    if(closestContainer === null || closestContainer === undefined) {
        self.latestMatch = latestOuterMatch;
    }else{
        if(closestContainer.contains(latestOuterMatch)){
            self.latestMatch = latestOuterMatch;
        }
    }
}
const linkClonedTemplate = ({disabled, clone, latestMatch, sym, self}: CssObserve) =>{
    if(disabled || !clone || !latestMatch) return;
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
export class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))) implements ICssObserve{
    static is = 'css-observe';
    static attributeProps = ({observe, selector, clone, disabled, customStyles, latestOuterMatch, latestMatch, withinClosest}: CssObserve) =>({
        bool: [observe, disabled, clone],
        obj: [latestOuterMatch, latestMatch],
        notify: [latestMatch],
        str: [selector, customStyles, withinClosest],
        reflect: [observe, disabled, clone, selector]
    } as AttributeProps);

    /**
     * @private
     * Needs to be unique symbol per instance
     */
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

    /**
     * Insert some associated needed styles.
     */
    customStyles = '';

    /**
     * @private
     */
    propActions = [
        linkInsertListener,
        linkClosestContainer,
        linkLatestMatch,
        linkClonedTemplate
    ]

    /**
     * @private
     */
    latestOuterMatch: Element | undefined;

    /**
     * Latest Element matching css selector (and within the element specified by within-closest)
     */
    latestMatch: Element | undefined;

    /**
     * Matching elements must fall within the closest ancestor matching this css expression.
     * @attr
     */
    withinClosest:  string | undefined;

    /**
     * @private
     */
    closestContainer: Element | undefined | null;

    insertListener(e: AnimationEvent){
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() =>{
                this.latestOuterMatch = target as Element;
            }, 0)
            
        }
    }
}

define(CssObserve);