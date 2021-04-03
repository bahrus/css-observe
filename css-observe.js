import { xc } from 'xtal-element/lib/XtalCore.js';
import { observeCssSelector } from 'xtal-element/lib/observeCssSelector.js';
const linkInsertListener = ({ disabled, observe, selector, self, customStyles, isConn }) => {
    self.disconnect();
    if (disabled || !observe || selector === undefined)
        return;
    if (self.id === '') {
        self.id = CssObserve.is + (new Date()).valueOf();
    }
    self.addCSSListener(self.id, selector, self.insertListener, customStyles);
};
const linkClosestContainer = ({ withinClosest, self }) => {
    if (withinClosest === undefined) {
        delete self.closestContainer;
    }
    else {
        self.closestContainer = self.closest(withinClosest);
        if (self.closestContainer === null) {
            console.warn("Could not locate closest container.");
        }
    }
};
const linkLatestMatch = ({ latestOuterMatch, closestContainer, self }) => {
    if (latestOuterMatch === undefined)
        return;
    if (closestContainer === null || closestContainer === undefined) {
        self.latestMatch = latestOuterMatch;
    }
    else {
        if (closestContainer.contains(latestOuterMatch)) {
            self.latestMatch = latestOuterMatch;
        }
    }
};
const linkClonedTemplate = ({ disabled, clone, latestMatch, sym, self }) => {
    if (disabled || !clone || !latestMatch)
        return;
    const templ = self.querySelector('template');
    const parent = self.parentElement;
    if (parent !== null && (!parent[sym]) && templ !== null) {
        parent.appendChild(templ.content.cloneNode(true));
        parent[sym] = true;
    }
};
const propActions = [
    linkInsertListener,
    linkClosestContainer,
    linkLatestMatch,
    linkClonedTemplate
];
const bool = {
    type: Boolean,
    reflect: true
};
const obj = {
    type: Object
};
const str = {
    type: String
};
const propDefMap = {
    observe: bool, disabled: bool, clone: bool,
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
export class CssObserve extends observeCssSelector(HTMLElement) {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
        /**
         * Insert some associated needed styles.
         */
        this.customStyles = '';
        /**
         * @private
         * Needs to be unique symbol per instance
         */
        this.sym = Symbol();
    }
    attributeChangedCallback(n, ov, nv) {
        this.disabled = nv !== null;
    }
    insertListener(e) {
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() => {
                this.latestOuterMatch = target;
            }, 0);
        }
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
        this.isConn = true;
    }
    onPropChange(n, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
}
CssObserve.is = 'css-observe';
CssObserve.observedAttributes = ['disabled'];
xc.letThereBeProps(CssObserve, slicedPropDefs, 'onPropChange');
xc.define(CssObserve);
