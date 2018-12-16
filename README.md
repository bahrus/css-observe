[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/css-observe)

<a href="https://nodei.co/npm/css-observe/"><img src="https://nodei.co/npm/css-observe.png"></a>

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/css-observe@0.0.9/dist/css-observe.iife.min.js?compression=gzip">

# css-observe
Fire a custom event whenever an element matching a specified selector is added.

## Syntax

<!--
```
<custom-element-demo>
<template>
    <div>
        <wc-info package-name="npm install css-observe" href="https://unpkg.com/css-observe@0.0.9/web-components.json"></wc-info>
        <script type="module" src="https://unpkg.com/wc-info@0.0.13/wc-info.js?module"></script>
    </div>
</template>
</custom-element-demo>
```
-->

## Example

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

<!--
```
<custom-element-demo>
  <template>
    <div>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/p-d.p-u@0.0.88/dist/p-all.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/css-observe@0.0.6/dist/css-observe.iife.js"></script>
        <css-observe disabled id="myObserver" observe selector="div[test]"></css-observe>
        <p-d on="latest-match-changed" prop="innerText" val="detail.value.dataset.message" skip-init></p-d>
        <div></div>
        <hr>
        <div test data-message="hello">
            I am here
        </div>
    </div>
  </template>
</custom-element-demo>
```
-->

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ npm tests
```

