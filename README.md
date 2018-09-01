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
