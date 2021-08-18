import {CssObserveProps} from './types.js';
import {observeCssSelector} from 'trans-render/lib/mixins/observeCssSelector.js';
export {CssObserveProps as ICssObserve} from './types.js';
import {PropInfo, define} from 'trans-render/lib/define.js';
import {INotifyPropInfo, NotifyMixin} from 'trans-render/lib/mixins/notify.js';

export class CssObserveCore extends observeCssSelector(HTMLElement){

    linkClosestContainer(self: cc){
        const {withinClosest} = self;
        if(withinClosest === undefined){
            return null;
        }else{
            const closestContainer = self.closest(withinClosest);
            if(closestContainer === null){
                console.warn("Could not locate closest container.");
            }else{
                return <cc>{closestContainer};
            }
        }
    }
    linkInsertListener(self: cc){
        const {
            enabled, observe, selector, isC, customStyles, 
            addCSSListener} = self;
        this.disconnect();
        //if(disabled || !observe || selector === undefined) return;
        if(self.id === ''){
            self.id = tagName + (new Date()).valueOf();
        }
        const boundAddCssListener = addCSSListener.bind(this);
        boundAddCssListener(self.id, selector!, this.insertListener, customStyles);
    }
    linkLatestMatch(self: cc){
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

    linkClonedTemplate(self: cc){
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

const CssObserve = define<CssObserveCore, INotifyPropInfo>({
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
                notify: {viaCustEvt: true}
            },
            disabled:{
                notify: {toggleTo: 'enabled'}
            }
        },
        actions:[
            {
                do: 'linkClosestContainer',
                upon: ['withinClosest'],
                merge: true,
            },{
                do: 'linkInsertListener',
                upon: ['enabled', 'observe', 'selector', 'isC'],
                riff: '"',
            },{
                do: 'linkLatestMatch',
                upon: ['latestOuterMatch', 'closestContainer'],
                riff: ['latestOuterMatch'],
                merge: true
            },{
                do: 'linkClonedTemplate',
                upon: ['enabled', 'clone', 'latestMatch'],
                riff: '"'
            }
        ],
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