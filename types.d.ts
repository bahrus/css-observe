import {Matches, Transformer, RenderContext} from 'trans-render/lib/types';
/**
 * @additionalProperties {
 *  "elementName": "css-observe"
 * } 
 */
export interface CssObserveEndUserProps{
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
    latestMatch?: WeakRef<EventTarget>;

    allMatches?: WeakRef<EventTarget>[];
    
    disabled?: boolean;
    enabled?: boolean;
    

    latestOuterMatch?: Element;
    closestContainer?: Element | null;

    /**
     * ID of script reference in same ShadowDOM realm
     */
    scriptRef?: string;

    targetTransform?: Matches;

    hostTransform?: Matches;

    
}

export interface CssObserveProps extends CssObserveEndUserProps{
    action?: any;
    isC?: boolean;
    targetTransformer?: Transformer;
    hostTransformer?: Transformer;
}



type P = Partial<CssObserveProps>;
export interface CSSObserveActions{
    locateClosestContainer(self: this): P | null | undefined;
    addCssListener(self: this): void;
    declareLatestMatch(self: this): P | undefined;
    watchForScript(self: this): void;
    doActionOnExistingMatches(self: this): void;
    doActionOnLatestMatch(self: this): void;
    onTargetTransform(self: this): void;
    doTransformOnExistingMatches(self: this): void;
    doTransformOnLatestMatch(self: this): void;
    onHostTransform(self: this): void;
}
