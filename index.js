var d = require('dson.js').DSON
var utils = require('lisa.utils')
var uType =  utils.Type


var innerGetFunctionMark = ( obj ,initMap, tgtFunctionMap) =>{
    for(var key in tgtFunctionMap){
        if(tgtFunctionMap[key] == obj.value){
            return `[[${key}]]`
        }
    }
    for(var key in initMap){
        if(initMap[key] == obj.value){
            tgtFunctionMap[key] = obj.value
            return `[[${key}]]`
        }
    }
    if(obj.key &&  !tgtFunctionMap[obj.key]){
        tgtFunctionMap[obj.key] = obj.value
        return `[[${obj.key}]]`
    }
    var index = (tgtFunctionMap._index  || 0) +1
    tgtFunctionMap._index = index
    tgtFunctionMap['auto' + index] = obj.value
    return `[[${'auto' + index}]]`
}


var rawify =   async (dson , options)=>{
    options  = options || {}
    options.initFunctionMap =  options.initFunctionMap || {}
    options.functionMap = options.functionMap || {}
    var rawDson = dson
    if(uType.isObject(dson) && (uType.isFunction(dson.isDSON) && dson.isDSON()  || uType.isFunction(dson.isJVD) && dson.isJVD() )){
        /*{
                            item: itemName,
                            params: args,
                            type: 'dson'
                        })*/
        rawDson = await d('_queue')
        .set((key,value)=>{
            return (uType.isObject(value) && ( uType.isFunction(value.isDSON) && value.isDSON()  || uType.isFunction(value.isJVD) &&  value.isJVD()))
        },null , async (data)=>{
            return  await rawify(data.value,options)
        })
        .set((key,value)=>{
            return uType.isFunction(value) || uType.isAsyncFunction(value) || uType.isRegExp(value)
        } ,null , data=>{
            return innerGetFunctionMark(data,options.initFunctionMap,options.functionMap)
        })
        .mark('q').select((data, context)=>{
            if(uType.isFunction(dson.isDSON) && dson.isDSON()){
                return {
                    isRawDSON :true,
                    _queue : data
                }
            }
            else{
                return {
                    isRawJVD : true,
                    _queue : data
                }
            }
        }).doDraw(dson)
    }else if(uType.isObject(dson) || uType.isArray(dson)){
        rawDson = await d()
        .set((key,value)=>{
            return (uType.isObject(value) && ( uType.isFunction(value.isDSON) && value.isDSON()  || uType.isFunction(value.isJVD) &&  value.isJVD()))
        },null , async (data)=>{
            return  await rawify(data.value,options)
        }).debug(
            (data,context)=>{
                var c1 = 1
            }
        )
        .set((key,value)=>{
            return uType.isFunction(value) || uType.isAsyncFunction(value) || uType.isRegExp(value)
        } ,null , data=>{
            return innerGetFunctionMark(data,options.initFunctionMap,options.functionMap)
        })
        .doDraw(dson)
    }
    return rawDson
}

exports.stringify = async (dson , options)=>{
    return  JSON.stringify (await rawify (dson,options))
}

exports.parse = async (dsonString)=>{

}