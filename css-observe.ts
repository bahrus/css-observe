import {CSSObserveActions, CssObserveProps} from './types.js';
import {observeCssSelector} from 'trans-render/lib/mixins/observeCssSelector.js';
export {CssObserveProps as ICssObserve} from './types.js';
import {PropInfo, CE} from 'trans-render/lib/CE.js';
import {INotifyPropInfo, NotifyMixin} from 'trans-render/lib/mixins/notify.js';

export class CssObserveCore extends observeCssSelector(HTMLElement) implements CSSObserveActions{

    locateClosestContainer(self: this){
        const {withinClosest} = self;
        const closestContainer = self.closest(withinClosest!);
        if(closestContainer === null){
            console.warn("Could not locate closest container.");
        }else{
            return {closestContainer} as pcc;
        }
    }
    addCssListener(self: this){
        const {
            enabled, observe, selector, isC, customStyles, 
            addCSSListener} = self;
        this.disconnect();
        if(self.id === ''){
            self.id = tagName + (new Date()).valueOf();
        }
        const boundAddCssListener = addCSSListener.bind(this);
        boundAddCssListener(self.id, selector!, this.insertListener, customStyles);
    }
    declareLatestMatch(self: this){
        const {latestOuterMatch, closestContainer} =  self;
        const returnObj: pcc = {latestMatch: latestOuterMatch};
        if(closestContainer === null || closestContainer === undefined) {
            return returnObj;
        }else{
            if(closestContainer.contains(latestOuterMatch!)){
                return returnObj;
            }
        }
    }

    insertListener(e: AnimationEvent){
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() =>{
                this.latestOuterMatch = target as Element;
            }, 0)
            
        }
    }

    linkClonedTemplate(self: this){
        const {disabled, clone, latestMatch, sym} = self;
        const templ = self.querySelector('template');
        const parent = self.parentElement;
        if(parent !== null && (!(<any>parent)[sym]) && templ !== null) {
            parent.appendChild(templ.content.cloneNode(true));
            (<any>parent)[sym] = true;
        }
    }

    /**
     * @private
     * Needs to be unique symbol per instance
     */
    sym = Symbol();  
}
type cc = CssObserveCore;
type pcc = Partial<CssObserveCore>;
const tagName = 'css-observe';
export interface CssObserveCore extends CssObserveProps, INotifyPropInfo{}

export const CssObserve = (new CE<CssObserveCore, CSSObserveActions, INotifyPropInfo>()).def({
    config:{
        tagName: tagName,
        propDefaults: {
            disabled: false, enabled: true, observe: false, isC: true, clone: false,
        },
        propInfo:{
            selector: {
                type: 'String'
            },
            latestMatch:{
                notify: {dispatch: true}
            },
            disabled:{
                notify: {toggleTo: 'enabled'}
            }
        },
        actions:{
            locateClosestContainer: {
                ifAllOf: ['withinClosest'],
            },
            addCssListener: {
                ifAllOf: ['enabled', 'observe', 'selector', 'isC'],
            },
            declareLatestMatch: {
                ifAllOf: ['latestOuterMatch'],
                andAlsoActIfKeyIn: ['closestContainer'],
                
            },
            linkClonedTemplate: {
                ifAllOf: ['enabled', 'clone', 'latestMatch'],
            }
        },
        style:{
            display: 'none'
        }
    },
    superclass: CssObserveCore,
    mixins: [NotifyMixin],
}) as {new(): cc};

declare global {
    interface HTMLElementTagNameMap {
        "css-observe": CssObserveCore,
    }
}