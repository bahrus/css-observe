import {CSSObserveActions, CssObserveProps} from './types.js';
import {observeCssSelector} from 'trans-render/lib/mixins/observeCssSelector.js';
export {CssObserveProps} from './types.js';
//import {PropInfo, CE} from 'trans-render/lib/CE.js';
import {XE} from 'xtal-element/src/XE.js';
import {INotifyMixin, INotifyPropInfo, NotifyMixin} from 'trans-render/lib/mixins/notify.js';
import {RenderContext} from 'trans-render/lib/types';

export class CssObserveCore extends observeCssSelector(HTMLElement) implements CSSObserveActions{
    
    locateClosestContainer({withinClosest}: this){
        const closestContainer = this.closest(withinClosest!);
        if(closestContainer === null){
            console.warn("Could not locate closest container.");
        }else{
            return {closestContainer} as P;
        }
    }
    addCssListener({enabled, observe, selector, isC, customStyles, addCSSListener}: this){
        this.disconnect();
        if(this.id === ''){
            this.id = tagName + (new Date()).valueOf();
        }
        const boundAddCssListener = addCSSListener.bind(this);
        boundAddCssListener(this.id, selector!, this.insertListener, customStyles);
        return {
            allMatches: []
        } as P;
    }

    async watchForScript({scriptRef}: this){
        const {importFromScriptRef} = await import('be-exportable/importFromScriptRef.js');
        const {action} = await importFromScriptRef(this, scriptRef!);
        return{
            action
        };
    }
    declareLatestMatch({latestOuterMatch, closestContainer, allMatches}: this){
        if(!closestContainer || closestContainer.contains(latestOuterMatch!)) {
            const latestMatch = new WeakRef(latestOuterMatch!);
            allMatches!.push(latestMatch!)
            return {latestMatch};
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

    doActionOnExistingMatches({action, allMatches}: this): void {
        for(const match of allMatches!){
            const el = match.deref();
            if(el === undefined) {
                continue;
            }
            action(el);
        }
    }

    doActionOnLatestMatch({latestMatch, action}: this): void {
        const el = latestMatch!.deref();
        if(el === undefined) return;
        action(el);
    }

    async onTargetTransform({targetTransform}: this): Promise<P>{
        const {DTR} = await import('trans-render/lib/DTR.js');
        const ctx: RenderContext = {
            host: this,
            match: targetTransform
        };
        const targetTransformer = new DTR(ctx);
        return {targetTransformer};
    }

    async onHostTransform({hostTransform}: this): Promise<P> {
        const {DTR} = await import('trans-render/lib/DTR.js');
        const ctx: RenderContext = {
            host: this,
            match: hostTransform
        };
        const hostTransformer = new DTR(ctx);
        return {hostTransformer};
    }

    async doTransformOnExistingMatches({allMatches, targetTransformer}: this): Promise<void> {
        for(const match of allMatches!){
            const el = match.deref();
            if(el === undefined) {
                continue;
            }
            await targetTransformer!.transform(el as Element);
        }
    }

    async doTransformOnLatestMatch({latestMatch, targetTransformer}: this): Promise<void> {
        const el = latestMatch!.deref();
        if(el === undefined) return;
        await targetTransformer!.transform(el as Element);
    }

    async doTransformOnHost({hostTransformer}: this): Promise<void>{
        await hostTransformer!.transform(this.getRootNode() as DocumentFragment);
    }
}
type cc = CssObserveCore;
type P = Partial<CssObserveCore>;
const tagName = 'css-observe';
export interface CssObserveCore extends CssObserveProps, INotifyPropInfo{}

const ce = new XE<CssObserveProps, CSSObserveActions>({
    config:{
        tagName,
        propDefaults: {
            disabled: false, 
            enabled: true, 
            observe: false, 
            isC: true,
            scriptRef: '',
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
                ifKeyIn: ['closestContainer'],
            },
            watchForScript: {
                ifAllOf: ['scriptRef'],
            },
            doActionOnExistingMatches:{
                ifAllOf: ['action', 'allMatches']
            },
            doActionOnLatestMatch:{
                ifAllOf: ['action', 'latestMatch']
            },
            onTargetTransform: 'targetTransform',
            doTransformOnExistingMatches:{
                ifAllOf: ['targetTransformer', 'allMatches']
            }
            // doTransformOnExistingMatches{

            // }
        },
        style:{
            display: 'none'
        }

    },
    superclass: CssObserveCore,
});


declare global {
    interface HTMLElementTagNameMap {
        "css-observe": CssObserveCore,
    }
}