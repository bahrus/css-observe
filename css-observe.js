import { observeCssSelector } from 'trans-render/lib/mixins/observeCssSelector.js';
import { CE } from 'trans-render/lib/CE.js';
import { NotifyMixin } from 'trans-render/lib/mixins/notify.js';
export class CssObserveCore extends observeCssSelector(HTMLElement) {
    locateClosestContainer(self) {
        const { withinClosest } = self;
        const closestContainer = self.closest(withinClosest);
        if (closestContainer === null) {
            console.warn("Could not locate closest container.");
        }
        else {
            return { closestContainer };
        }
    }
    addCssListener(self) {
        const { enabled, observe, selector, isC, customStyles, addCSSListener } = self;
        this.disconnect();
        if (self.id === '') {
            self.id = tagName + (new Date()).valueOf();
        }
        const boundAddCssListener = addCSSListener.bind(this);
        boundAddCssListener(self.id, selector, this.insertListener, customStyles);
    }
    declareLatestMatch(self) {
        const { latestOuterMatch, closestContainer } = self;
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
    linkClonedTemplate(self) {
        const { disabled, clone, latestMatch, sym } = self;
        const templ = self.querySelector('template');
        const parent = self.parentElement;
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
                andAlsoActIfKeyIn: ['closestContainer'],
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
