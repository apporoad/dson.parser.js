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
parser.stringify(d(),options).then(str=>{
    console.log(str)

    // parse it
    parser.parse(str,options).then(d=>{

    })
})


```


## 如何打包

```bash
npm i -g browserify

browserify -r ./index.js:dson.parser.js -o build/dson.parser.js
```