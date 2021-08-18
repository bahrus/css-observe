import {IHydrate} from 'trans-render/types.d.js';
/**
 * @additionalProperties {
 *  "elementName": "css-observe"
 * } 
 */
export interface CssObserveProps{
    /**
     * CSS selector to monitor for.
     * @attr
     */
    selector?: string;

    /**
     * This attribute/property must be present/true for anything to happen.
     * @attr
     */
    observe?: boolean;

    
    /**
     * Clone template inside when css match is found.
     * @attr
     */
    clone?:  boolean;

    /**
     * @private
     * Needs to be unique symbol per instance
     */
    sym?: Symbol;

    /**
     * Insert some associated needed styles.
     */
    customStyles: string;

    /**
     * Matching elements must fall within the closest ancestor matching this css expression.
     * @additionalProperties {"attr":"within-closest"}
     */
    withinClosest?:  string;

    /**
     * Latest Element matching css selector (and within the element specified by within-closest)
     */
    latestMatch?: EventTarget;
    
    disabled?: boolean;
    enabled?: boolean;
    isC?: boolean;

    latestOuterMatch?: Element;
    closestContainer?: Element | null;
}
