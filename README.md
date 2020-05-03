# dson.parser.js
parser for dson

## just do it
```bash
npm i --save dson.parser.js
```

```js
var  parser = require('dson.parser.js')
var dson = require('dson.js').DSON

//stringify  your dson
var options = {}
var string = parser.stringify(d(),options)

// parse it
var yourDson = parser.parse(string,options)

```