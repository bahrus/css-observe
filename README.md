[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/css-observe)

<a href="https://nodei.co/npm/css-observe/"><img src="https://nodei.co/npm/css-observe.png"></a>

[![Actions Status](https://github.com/bahrus/css-observe/workflows/CI/badge.svg)](https://github.com/bahrus/css-observe/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/css-observe">

# css-observe
Fire a custom event whenever an element matching a specified selector is added to the (shadow dom) realm in which the instance is added.

## Syntax

<!--
```
<custom-element-demo>
<template>
    <div>
        <wc-info package-name="npm install css-observe" href="https://unpkg.com/css-observe@0.0.11/custom-elements.json"></wc-info>
        <script type="module" src="https://unpkg.com/wc-info@0.0.68/wc-info.js?module"></script>
    </div>
</template>
</custom-element-demo>
```
-->


```html
<script type="module" src="../css-observe.js"></script>
<css-observe id="myObserver" observe selector="div[test]"></css-observe>
<div test>
    I am here
</div>
```

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

