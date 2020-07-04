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
const linkClonedTemplate = ({ disabled, clone, latestMatch, sym, self }) => {
    if (disabled || !clone)
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
let CssObserve = /** @class */ (() => {
    class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
        constructor() {
            super(...arguments);
            this.sym = Symbol();
            this.customStyles = '';
            this.propActions = [
                linkInsertListener,
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
                    this.latestMatch = target;
                }, 0);
            }
        }
    }
    CssObserve.is = 'css-observe';
    CssObserve.attributeProps = ({ observe, selector, clone, disabled, customStyles, latestMatch }) => ({
        bool: [observe, disabled, clone],
        obj: [latestMatch],
        notify: [latestMatch],
        str: [selector, customStyles],
        reflect: [observe, disabled, clone, selector]
    });
    return CssObserve;
})();
export { CssObserve };
define(CssObserve);
