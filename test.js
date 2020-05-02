var paser = require('./')

var json = {
    hello : 'world',
    fun : ()=>{}
}

var test = async ()=>{
var string = await paser.stringify(json)

console.log(string)

}


test()