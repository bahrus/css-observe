import {ReactiveSurface, xc, IReactor} from 'xtal-element/lib/XtalCore.js';
import {observeCssSelector} from 'xtal-element/lib/observeCssSelector.js';
import {CssObserveProps} from './types.js';
export {CssObserveProps as ICssObserve} from './types.js';
import {PropDef, PropDefMap, PropAction} from 'xtal-element/types.d.js';


const linkInsertListener = ({disabled, observe, selector, self, customStyles, isConn}: CssObserve) =>{
    self.disconnect();
    if(disabled || !observe || selector === undefined) return;
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

const propActions = [
    linkInsertListener,
    linkClosestContainer,
    linkLatestMatch,
    linkClonedTemplate
] as PropAction[];


const bool: PropDef = {
    type: Boolean,
    reflect: true
};
const obj: PropDef = {
    type: Object
};
const str: PropDef = {
    type: String
};
const propDefMap: PropDefMap<CssObserve> = {
    observe: bool, disabled:  bool, clone: bool,
    latestOuterMatch: obj, 
    isConn: {
        type: Boolean,
        stopReactionsIfFalsy: true,
    },
    latestMatch: {
        type: Object,
        notify: true,
        stopNotificationIfFalsy: true,
    },
    selector: {
        type: String,
        reflect: true,
    }, 
    customStyles: str, withinClosest: str,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);

export class CssObserve extends observeCssSelector(HTMLElement) implements CssObserveProps, ReactiveSurface{
    static is = 'css-observe';
    static observedAttributes = ['disabled'];
    attributeChangedCallback(n: string, ov: string, nv: string){
        this.disabled = nv !== null;
    }
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);


    /**
     * @private
     */
    latestOuterMatch: Element | undefined;


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

    /**
     * @private
     * Needs to be unique symbol per instance
     */
    sym = Symbol();    
    isConn: boolean | undefined;
    connectedCallback(){
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
        this.isConn = true;
    }
    onPropChange(n: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }

}
export interface CssObserve extends CssObserveProps{}
xc.letThereBeProps(CssObserve, slicedPropDefs, 'onPropChange');
xc.define(CssObserve);

declare global {
    interface HTMLElementTagNameMap {
        "css-observe": CssObserve,
    }
}