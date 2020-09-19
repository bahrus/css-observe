import { CssObserve } from './css-observe.js';
/**
 * @element css-observe
 */
export class CSSObserveExample0 extends CssObserve {
    constructor() {
        super(...arguments);
        this.selector = '';
        this.observe = false;
        this.clone = false;
        this.withinClosest = '';
    }
}
