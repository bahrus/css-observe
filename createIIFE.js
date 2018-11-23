const jiife = require('jiife');
const xl = 'node_modules/xtal-latx/';
jiife.processFiles([xl + 'define.js', xl + 'getHost.js', xl + 'observeCssSelector.js', xl + 'xtal-latx.js', 'css-observe.js'], 'dist/css-observe.iife.js');