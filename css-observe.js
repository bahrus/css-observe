import { observeCssSelector } from 'trans-render/lib/mixins/observeCssSelector.js';
import { define } from 'trans-render/lib/define.js';
import { NotifyMixin } from 'trans-render/lib/mixins/notify.js';
export class CssObserveCore extends observeCssSelector(HTMLElement) {
    linkClosestContainer(self) {
        const { withinClosest } = self;
        if (withinClosest === undefined) {
            delete self.closestContainer;
        }
        else {
            self.closestContainer = self.closest(withinClosest);
            if (self.closestContainer === null) {
                console.warn("Could not locate closest container.");
            }
        }
    }
    linkInsertListener(self) {
        const { enabled, observe, selector, isC, customStyles, addCSSListener } = self;
        this.disconnect();
        //if(disabled || !observe || selector === undefined) return;
        if (self.id === '') {
            self.id = tagName + (new Date()).valueOf();
        }
        const boundAddCssListener = addCSSListener.bind(this);
        boundAddCssListener(self.id, selector, this.insertListener, customStyles);
    }
    linkLatestMatch(self) {
        const { latestOuterMatch, closestContainer } = self;
        if (closestContainer === null || closestContainer === undefined) {
            self.latestMatch = latestOuterMatch;
        }
        else {
            if (closestContainer.contains(latestOuterMatch)) {
                self.latestMatch = latestOuterMatch;
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
const CssObserve = define({
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
                notify: { viaCustEvt: true }
            },
            disabled: {
                notify: { toggleTo: 'enabled' }
            }
        },
        actions: [
            {
                do: 'linkClosestContainer',
                upon: ['withinClosest']
            }, {
                do: 'linkInsertListener',
                upon: ['enabled', 'observe', 'selector', 'isC'],
                riff: '"',
            }, {
                do: 'linkLatestMatch',
                upon: ['latestOuterMatch', 'closestContainer'],
                riff: ['latestOuterMatch']
            }, {
                do: 'linkClonedTemplate',
                upon: ['enabled', 'clone', 'latestMatch'],
                riff: '"'
            }
        ],
        style: {
            display: 'none'
        }
    },
    superclass: CssObserveCore,
    mixins: [NotifyMixin],
});
