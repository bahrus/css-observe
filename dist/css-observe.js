//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
function hydrate(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         * @private
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}

const debounce = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};

/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    var _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                /**
                 * Tracks how many times each event type was called.
                 */
                this.__evCount = {};
                /**
                 * @private
                 */
                this.self = this;
                this._xlConnected = false;
                this.__propActionQueue = new Set();
            }
            /**
             * @private
             */
            static get evalPath() {
                return lispToCamel(this.is);
            }
            /**
             * @private
             */
            static get observedAttributes() {
                const props = this.props;
                return [...props.bool, ...props.num, ...props.str, ...props.jsonProp].map(s => camelToLisp(s));
            }
            static get props() {
                if (this.is === undefined)
                    return {};
                if (this[this.evalPath] === undefined) {
                    const args = deconstruct(this.attributeProps);
                    const arg = {};
                    args.forEach(token => {
                        arg[token] = token;
                    });
                    this[this.evalPath] = this.attributeProps(arg);
                    const ep = this[this.evalPath];
                    propCategories.forEach(propCat => {
                        ep[propCat] = ep[propCat] || [];
                    });
                }
                let props = this[this.evalPath];
                const superProps = Object.getPrototypeOf(this).props;
                if (superProps !== undefined)
                    props = mergeProps(props, superProps);
                return props;
            }
            /**
             * Turn number into string with even and odd values easy to query via css.
             * @param n
             */
            __to$(n) {
                const mod = n % 2;
                return (n - mod) / 2 + '-' + mod;
            }
            /**
             * Increment event count
             * @param name
             */
            __incAttr(name) {
                const ec = this.__evCount;
                if (name in ec) {
                    ec[name]++;
                }
                else {
                    ec[name] = 0;
                }
                this.attr('data-' + name, this.__to$(ec[name]));
            }
            onPropsChange(name) {
                let isAsync = false;
                const propInfoLookup = this.constructor[propInfoSym];
                if (Array.isArray(name)) {
                    name.forEach(subName => {
                        this.__propActionQueue.add(subName);
                        const propInfo = propInfoLookup[subName];
                        if (propInfo !== undefined && propInfo.async)
                            isAsync = true;
                    });
                }
                else {
                    this.__propActionQueue.add(name);
                    const propInfo = propInfoLookup[name];
                    if (propInfo !== undefined && propInfo.async)
                        isAsync = true;
                }
                if (this.disabled || !this._xlConnected) {
                    return;
                }
                if (!this.disabled) {
                    if (isAsync) {
                        this.__processActionDebouncer();
                    }
                    else {
                        this.__processActionQueue();
                    }
                }
            }
            attributeChangedCallback(n, ov, nv) {
                this[atrInit] = true; // track each attribute?
                const ik = this[ignoreAttrKey];
                if (ik !== undefined && ik[n] === true) {
                    delete ik[n];
                    return;
                }
                const propName = lispToCamel(n);
                const privatePropName = '_' + propName;
                //TODO:  Do we need this?
                // if((<any>this)[ignorePropKey] === undefined) (<any>this)[ignorePropKey] = {};
                // (<any>this)[ignorePropKey][propName] = true;
                const anyT = this;
                const ep = this.constructor.props;
                if (ep.str.includes(propName)) {
                    anyT[privatePropName] = nv;
                }
                else if (ep.bool.includes(propName)) {
                    anyT[privatePropName] = nv !== null;
                }
                else if (ep.num.includes(propName)) {
                    anyT[privatePropName] = parseFloat(nv);
                }
                else if (ep.jsonProp.includes(propName)) {
                    try {
                        anyT[privatePropName] = JSON.parse(nv);
                    }
                    catch (e) {
                        anyT[privatePropName] = nv;
                    }
                }
                this.onPropsChange(propName);
            }
            connectedCallback() {
                super.connectedCallback();
                this._xlConnected = true;
                this.__processActionDebouncer();
                this.onPropsChange('');
            }
            /**
             * Dispatch Custom Event
             * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
             * @param detail Information to be passed with the event
             * @param asIs If true, don't append event name with '-changed'
             * @private
             */
            [de](name, detail, asIs = false) {
                if (this.disabled)
                    return;
                const eventName = name + (asIs ? '' : '-changed');
                let bubbles = false;
                let composed = false;
                let cancelable = false;
                if (this.eventScopes !== undefined) {
                    const eventScope = this.eventScopes.find(x => (x[0] === undefined) || x[0].startsWith(eventName));
                    if (eventScope !== undefined) {
                        bubbles = eventScope[1] === 'bubbles';
                        cancelable = eventScope[2] === 'cancelable';
                        composed = eventScope[3] === 'composed';
                    }
                }
                const newEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: bubbles,
                    composed: composed,
                    cancelable: cancelable,
                });
                this.dispatchEvent(newEvent);
                this.__incAttr(eventName);
                return newEvent;
            }
            get __processActionDebouncer() {
                if (this.___processActionDebouncer === undefined) {
                    this.___processActionDebouncer = debounce((getNew = false) => {
                        this.__processActionQueue();
                    }, 16);
                }
                return this.___processActionDebouncer;
            }
            propActionsHub(propAction) { }
            __processActionQueue() {
                if (this.propActions === undefined)
                    return;
                const queue = this.__propActionQueue;
                this.__propActionQueue = new Set();
                this.propActions.forEach(propAction => {
                    const dependencies = deconstruct(propAction);
                    const dependencySet = new Set(dependencies);
                    if (intersection(queue, dependencySet).size > 0) {
                        this.propActionsHub(propAction);
                        propAction(this);
                    }
                });
            }
        },
        /**
         * @private
         * @param param0
         */
        _a.attributeProps = ({ disabled }) => ({
            bool: [disabled],
        }),
        _a;
}
//utility fns
//const ignorePropKey = Symbol();
const ignoreAttrKey = Symbol();
const propInfoSym = Symbol('propInfo');
const atrInit = Symbol('atrInit');
function define(MyElementClass) {
    const tagName = MyElementClass.is;
    let n = 0;
    let foundIt = false;
    let isNew = false;
    let name = tagName;
    do {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test !== undefined) {
            if (test === MyElementClass) {
                foundIt = true; //all good;
                MyElementClass.isReally = name;
            }
        }
        else {
            isNew = true;
            MyElementClass.isReally = name;
            foundIt = true;
        }
        n++;
    } while (!foundIt);
    if (!isNew)
        return;
    const props = MyElementClass.props;
    const proto = MyElementClass.prototype;
    const flatProps = [...props.bool, ...props.num, ...props.str, ...props.obj];
    const existingProps = Object.getOwnPropertyNames(proto);
    MyElementClass[propInfoSym] = {};
    flatProps.forEach(prop => {
        if (existingProps.includes(prop))
            return;
        const privateKey = '_' + prop;
        const propInfo = {};
        propCategories.forEach(cat => {
            propInfo[cat] = props[cat].includes(prop);
        });
        MyElementClass[propInfoSym][prop] = propInfo;
        //TODO:  make this a bound function?
        Object.defineProperty(proto, prop, {
            get() {
                return this[privateKey];
            },
            set(nv) {
                const propInfo = MyElementClass[propInfoSym][prop];
                if (propInfo.dry) {
                    if (nv === this[privateKey])
                        return;
                }
                const c2l = camelToLisp(prop);
                if (propInfo.reflect) {
                    //experimental line -- we want the attribute to take precedence over default value.
                    if (this[atrInit] === undefined && this.hasAttribute(c2l))
                        return;
                    if (this[ignoreAttrKey] === undefined)
                        this[ignoreAttrKey] = {};
                    this[ignoreAttrKey][c2l] = true;
                    if (propInfo.bool) {
                        if ((nv && !this.hasAttribute(c2l)) || nv === false) {
                            this.attr(c2l, nv, '');
                        }
                        else {
                            this[ignoreAttrKey][c2l] = false;
                        }
                    }
                    else if (propInfo.str) {
                        this.attr(c2l, nv);
                    }
                    else if (propInfo.num) {
                        this.attr(c2l, nv.toString());
                    }
                    else if (propInfo.obj) {
                        this.attr(c2l, JSON.stringify(nv));
                    }
                }
                this[privateKey] = nv;
                if (propInfo.log) {
                    console.log(propInfo, nv);
                }
                if (propInfo.debug)
                    debugger;
                this.onPropsChange(prop);
                if (propInfo.notify) {
                    this[de](c2l, { value: nv });
                }
            },
            enumerable: true,
            configurable: true
        });
    });
    customElements.define(name, MyElementClass);
}
const de = Symbol.for('1f462044-3fe5-4fa8-9d26-c4165be15551');
function mergeProps(props1, props2) {
    const returnObj = {};
    propCategories.forEach(propCat => {
        returnObj[propCat] = (props1[propCat] || []).concat(props2[propCat] || []);
    });
    return returnObj;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
const ltcRe = /(\-\w)/g;
function lispToCamel(s) {
    return s.replace(ltcRe, function (m) { return m[1].toUpperCase(); });
}
const ctlRe = /[\w]([A-Z])/g;
function camelToLisp(s) {
    return s.replace(ctlRe, function (m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}
const propCategories = ['bool', 'str', 'num', 'reflect', 'notify', 'obj', 'jsonProp', 'dry', 'log', 'debug', 'async'];
const argList = Symbol('argList');
function substrBefore(s, search) {
    let returnS = s.trim();
    let iPosOfColon = returnS.indexOf(search);
    if (iPosOfColon > -1)
        return returnS.substr(0, iPosOfColon);
    return returnS;
}
function deconstruct(fn) {
    if (fn[argList] === undefined) {
        const fnString = fn.toString().trim();
        if (fnString.startsWith('({')) {
            const iPos = fnString.indexOf('})', 2);
            fn[argList] = fnString.substring(2, iPos).split(',').map(s => substrBefore(s, ':'));
        }
        else {
            fn[argList] = [];
        }
    }
    return fn[argList];
}

//import {getShadowContainer} from './getShadowContainer.js';
const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
function addCSSListener(id, self, targetSelector, insertListener, customStyles = '') {
    // See https://davidwalsh.name/detect-node-insertion
    if (self._boundInsertListeners === undefined) {
        self._boundInsertListeners = {};
    }
    const boundInsertListeners = self._boundInsertListeners;
    if (boundInsertListeners[targetSelector] !== undefined)
        return;
    const styleInner = /* css */ `
        @keyframes ${id} {
            from {
                opacity: 0.99;
            }
            to {
                opacity: 1;
            }
        }

        ${targetSelector}{
            animation-duration: 0.001s;
            animation-name: ${id};
        }

        ${customStyles}`;
    const style = document.createElement('style');
    style.innerHTML = styleInner;
    self._host = self.getRootNode(); //experimental  <any>getShadowContainer((<any>this as HTMLElement));
    if (self._host.nodeType === 9) {
        self._host = document.firstElementChild;
    }
    const hostIsShadow = self._host.localName !== 'html';
    if (hostIsShadow) {
        self._host.appendChild(style);
    }
    else {
        document.head.appendChild(style);
    }
    boundInsertListeners[targetSelector] = insertListener.bind(self);
    const container = hostIsShadow ? self._host : document;
    eventNames.forEach(name => {
        container.addEventListener(name, boundInsertListeners[targetSelector], false);
    });
}
function observeCssSelector(superClass) {
    return class extends superClass {
        addCSSListener(id, targetSelector, insertListener, customStyles = '') {
            addCSSListener(id, this, targetSelector, insertListener, customStyles);
        }
        disconnect() {
            if (this._boundInsertListener) {
                const hostIsShadow = this._host.localName !== 'html';
                const container = hostIsShadow ? this._host : document;
                eventNames.forEach(name => {
                    container.removeEventListener(name, this._boundInsertListener);
                });
            }
        }
        disconnectedCallback() {
            this.disconnect();
            if (super.disconnectedCallback !== undefined)
                super.disconnectedCallback();
        }
    };
}

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
class CssObserve extends observeCssSelector(XtallatX(hydrate(HTMLElement))) {
    constructor() {
        super(...arguments);
        /**
         * @private
         * Needs to be unique symbol per instance
         */
        this.sym = Symbol();
        /**
         * Insert some associated needed styles.
         */
        this.customStyles = '';
        /**
         * @private
         */
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
/**
 * @private
 */
CssObserve.is = 'css-observe';
/**
 *
 * @private
 */
CssObserve.attributeProps = ({ observe, selector, clone, disabled, customStyles, latestOuterMatch, latestMatch, withinClosest }) => ({
    bool: [observe, disabled, clone],
    obj: [latestOuterMatch, latestMatch],
    notify: [latestMatch],
    str: [selector, customStyles, withinClosest],
    reflect: [observe, disabled, clone, selector]
});
define(CssObserve);

export { CssObserve };
