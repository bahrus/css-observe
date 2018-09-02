# css-observe
Fire a custom event whenever an element matching a specified selector is added.

Syntax:

```html
<script type="module" src="../css-observe.js"></script>
<css-observe id="myObserver" observe selector="div[test]"></css-observe>
<div test>
    I am here
</div>
```

css-observe will fire event: latest-match-changed, and the newly added element can be obtained from event.detail.value.

<!--
```
<custom-element-demo>
  <template>
    <script async type="module" src="https://unpkg.com/p-d.p-u@0.0.67/p-d-x.js?module"></script>
    <script type="module" src="https://unpkg.com/css-observe@0.0.1/css-observe.js?module"></script>
    <css-observe disabled id="myObserver" observe selector="div[test]"></css-observe>
    <p-d on="latest-match-changed" skip-init to="{innerText:detail.value.dataset.message}"></p-d>
    <div></div>
    <hr>
    <div test data-message="hello">
        I am here
    </div>
  </template>
</custom-element-demo>
```
-->

## Implementation 

Based off of an idea found [here](https://davidwalsh.name/detect-node-insertion)