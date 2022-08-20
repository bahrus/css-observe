[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/css-observe)

<a href="https://nodei.co/npm/css-observe/"><img src="https://nodei.co/npm/css-observe.png"></a>

[![Actions Status](https://github.com/bahrus/css-observe/workflows/CI/badge.svg)](https://github.com/bahrus/css-observe/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/css-observe@0.0.48">

# css-observe [WIP]

css-observe is a "web component as a service" that specializes in watching for DOM elements matching a CSS selector appearing within the same Shadow DOM realm (or within a specified "closest" selector).  When such an element is spotted, css observe can perform up to four distinct actions:

1.  Fire an event.
2.  Perform a DTR transform on the newly discovered element ("target"). 
3.  Perform a DTR transform on the host's shadow DOM (or document when outside any shadow DOM).
4.  Perform an action contained within a script tag contained within.  


## [API Reference](https://bahrus.github.io/wc-info/cdn-base.html?npmPackage=css-observe)


```html
<div>
    <css-observe observe selector="div[test]" data-name="Clive" script-ref=my-script  options='{
        "targetTransform": {
            "span": "dataset.name"
        },
        "hostTransform":{
            "section": [{},{},{},"<span>found it</span>"]
        }
    }'>
    </css-observe>
    <script id=my-script nomodule be-exporting>
        export const action = (target) => {
            target.setAttribute('I am here', '');
        }
    </script>
    <div test>
        I am here, <span></span>
    </div>
    <section></section>
</div>
```

Another attribute / property, within-closest/withinClosest, restricts matches to those within the closest ancestry of the css-observe element matching the within-closest value.

css-observe will fire event: latest-match-changed, and the newly added element can be obtained from event.detail.value.

It will only observe the selector within the same Shadow DOM realm where the element is placed.  If the element is placed outside any ShadowDOM, it will observe the selector only outside any ShadowDOM.  How cool is that?

## Implementation 

Based off of an idea found [here](https://davidwalsh.name/detect-node-insertion)


## Viewing Your Element

```
$ npm install
$ npm run serve
```

## Running Tests

```
$ npm run test
```

