import { observeCssSelector } from 'trans-render/lib/mixins/observeCssSelector.js';
import { CE } from 'trans-render/lib/CE.js';
import { NotifyMixin } from 'trans-render/lib/mixins/notify.js';
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
    }
    declareLatestMatch({ latestOuterMatch, closestContainer }) {
        const returnObj = { latestMatch: latestOuterMatch };
        if (closestContainer === null || closestContainer === undefined) {
            return returnObj;
        }
        else {
            if (closestContainer.contains(latestOuterMatch)) {
                return returnObj;
            }
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
    linkClonedTemplate({ disabled, clone, latestMatch, sym }) {
        const templ = this.querySelector('template');
        const parent = this.parentElement;
        if (parent !== null && (!parent[sym]) && templ !== null) {
            parent.appendChild(templ.content.cloneNode(true));
            parent[sym] = true;
        }
    }
    /**
     * @private
     * Needs to be unique symbol per instance
     */
    sym = Symbol();
}
const tagName = 'css-observe';
export const CssObserve = (new CE()).def({
    config: {
        tagName: tagName,
        propDefaults: {
            disabled: false, enabled: true, observe: false, isC: true, clone: false,
        },
        propChangeMethod: 'onPropChange',
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
            linkClonedTemplate: {
                ifAllOf: ['enabled', 'clone', 'latestMatch'],
            }
        },
        style: {
            display: 'none'
        }
    },
    superclass: CssObserveCore,
    mixins: [NotifyMixin],
});
