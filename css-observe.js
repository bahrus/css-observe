import { hydrate } from 'trans-render/hydrate.js';
import { XtallatX, define } from 'xtal-element/xtal-latx.js';
import { observeCssSelector } from 'xtal-element/observeCssSelector.js';
const linkInsertListener = ({ disabled, observe, selector, self, customStyles }) => {
    self.disconnect();
    if (disabled || !observe || !self.isConnected || selector === undefined)
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
/**
 * @element css-observe
 * @event latest-match-changed - Fires when css match is found.
 */
export class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
    constructor() {
        super(...arguments);
        this.sym = Symbol();
        /**
         *
         */
        this.customStyles = '';
        this.propActions = [
            linkInsertListener,
            linkClosestContainer,
            linkLatestMatch,
            linkClonedTemplate
        ];
    }
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
    }
    insertListener(e) {
        if (e.animationName === this.id) {
            const target = e.target;
            setTimeout(() => {
                this.latestOuterMatch = target;
            }, 0);
        }
    }
}
CssObserve.is = 'css-observe';
CssObserve.attributeProps = ({ observe, selector, clone, disabled, customStyles, latestOuterMatch, latestMatch, withinClosest }) => ({
    bool: [observe, disabled, clone],
    obj: [latestOuterMatch, latestMatch],
    notify: [latestMatch],
    str: [selector, customStyles, withinClosest],
    reflect: [observe, disabled, clone, selector]
});
define(CssObserve);
