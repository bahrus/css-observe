import { observeCssSelector } from 'trans-render/lib/mixins/observeCssSelector.js';
//import {PropInfo, CE} from 'trans-render/lib/CE.js';
import { XE } from 'xtal-element/src/XE.js';
export class CssObserveCore extends observeCssSelector(HTMLElement) {
    locateClosestContainer({ withinClosest }) {
        const closestContainer = this.closest(withinClosest);
        if (closestContainer === null) {
            console.warn("Could not locate closest container.");
        }
        else {
            return { closestContainer };
        }
    }
    addCssListener({ enabled, observe, selector, isC, customStyles, addCSSListener }) {
        this.disconnect();
        if (this.id === '') {
            this.id = tagName + (new Date()).valueOf();
        }
        const boundAddCssListener = addCSSListener.bind(this);
        boundAddCssListener(this.id, selector, this.insertListener, customStyles);
        return {
            allMatches: []
        };
    }
    async watchForScript({ scriptRef }) {
        const { importFromScriptRef } = await import('be-exportable/importFromScriptRef.js');
        const { action } = await importFromScriptRef(this, scriptRef);
        return {
            action
        };
    }
    declareLatestMatch({ latestOuterMatch, closestContainer, allMatches }) {
        if (!closestContainer || closestContainer.contains(latestOuterMatch)) {
            const latestMatch = new WeakRef(latestOuterMatch);
            allMatches.push(latestMatch);
            return { latestMatch };
        }
    }
    insertListener(e) {
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() => {
                this.latestOuterMatch = target;
            }, 0);
        }
    }
    doActionOnExistingMatches({ action, allMatches }) {
        for (const match of allMatches) {
            const el = match.deref();
            if (el === undefined) {
                continue;
            }
            action(el);
        }
    }
    doActionOnLatestMatch({ latestMatch, action }) {
        const el = latestMatch.deref();
        if (el === undefined)
            return;
        action(el);
    }
    async onTargetTransform({ targetTransform }) {
        const { DTR } = await import('trans-render/lib/DTR.js');
        const ctx = {
            host: this,
            match: targetTransform
        };
        const targetTransformer = new DTR(ctx);
        return { targetTransformer };
    }
    async doTransformOnExistingMatches({ allMatches, targetTransformer }) {
        for (const match of allMatches) {
            const el = match.deref();
            if (el === undefined) {
                continue;
            }
            await targetTransformer.transform(el);
        }
    }
    async doTransformOnLatestMatch({ latestMatch, targetTransformer }) {
        const el = latestMatch.deref();
        if (el === undefined)
            return;
        await targetTransformer.transform(el);
    }
}
const tagName = 'css-observe';
const ce = new XE({
    config: {
        tagName,
        propDefaults: {
            disabled: false,
            enabled: true,
            observe: false,
            isC: true,
            scriptRef: '',
        },
        propInfo: {
            selector: {
                type: 'String'
            },
            latestMatch: {
                notify: { dispatch: true }
            },
            disabled: {
                notify: { toggleTo: 'enabled' }
            }
        },
        actions: {
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
            doActionOnExistingMatches: {
                ifAllOf: ['action', 'allMatches']
            },
            doActionOnLatestMatch: {
                ifAllOf: ['action', 'latestMatch']
            },
            onTargetTransform: 'targetTransform',
            doTransformOnExistingMatches: {
                ifAllOf: ['targetTransformer', 'allMatches']
            }
            // doTransformOnExistingMatches{
            // }
        },
        style: {
            display: 'none'
        }
    },
    superclass: CssObserveCore,
});
