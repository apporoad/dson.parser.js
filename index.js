var d = require('dson.js').DSON
var utils = require('lisa.utils')
var aes = require('lisa.aes.js')
var uType = utils.Type


var innerGetFunctionMark = (obj, initMap, tgtFunctionMap) => {
    for (var key in tgtFunctionMap) {
        if (tgtFunctionMap[key] == obj.value) {
            return `[[${key}]]`
        }
    }
    for (var key in initMap) {
        //目标fm 中必须没有该key , 防止被覆盖问题   / /todo 是否需要提醒重复情况
        if (initMap[key] == obj.value && !tgtFunctionMap[key]) {
            tgtFunctionMap[key] = obj.value
            return `[[${key}]]`
        }
    }
    if (obj.key && !tgtFunctionMap[obj.key]) {
        tgtFunctionMap[obj.key] = obj.value
        return `[[${obj.key}]]`
    }
    var index = (tgtFunctionMap._index || 0) + 1
    tgtFunctionMap._index = index
    tgtFunctionMap['auto' + index] = obj.value
    return `[[${'auto' + index}]]`
}


var rawify = async (dson, options) => {
    options = options || {}
    options.initFunctionMap = options.initFunctionMap || {}
    options.functionMap = options.functionMap || {}
    var rawDson = dson
    if (uType.isObject(dson) && (uType.isFunction(dson.isDSON) && dson.isDSON() || uType.isFunction(dson.isJVD) && dson.isJVD())) {
        /*{
                            item: itemName,
                            params: args,
                            type: 'dson'
                        })*/
        rawDson = await d('_queue')
            .set((key, value) => {
                return (uType.isObject(value) && (uType.isFunction(value.isDSON) && value.isDSON() || uType.isFunction(value.isJVD) && value.isJVD()))
            }, null, async (data) => {
                return await rawify(data.value, options)
            })
            .set((key, value) => {
                return uType.isFunction(value) || uType.isAsyncFunction(value) || uType.isRegExp(value)
            }, null, data => {
                return innerGetFunctionMark(data, options.initFunctionMap, options.functionMap)
            })
            .mark('q').select((data, context) => {
                if (uType.isFunction(dson.isDSON) && dson.isDSON()) {
                    return {
                        isRawDSON: true,
                        _queue: data
                    }
                } else {
                    return {
                        isRawJVD: true,
                        _queue: data
                    }
                }
            }).doDraw(dson)
    } else if (uType.isObject(dson) || uType.isArray(dson)) {
        rawDson = await d()
            .set((key, value) => {
                return (uType.isObject(value) && (uType.isFunction(value.isDSON) && value.isDSON() || uType.isFunction(value.isJVD) && value.isJVD()))
            }, null, async (data) => {
                return await rawify(data.value, options)
            })
            .set((key, value) => {
                return uType.isFunction(value) || uType.isAsyncFunction(value) || uType.isRegExp(value)
            }, null, data => {
                return innerGetFunctionMark(data, options.initFunctionMap, options.functionMap)
            })
            .doDraw(dson)
    }
    return rawDson
}


var jsonify = async (json, options) => {
    options = options || {}
    options.functionMap = options.functionMap || {}
    var dson = json
    if (uType.isObject(dson) && (dson.isRawDSON || dson.isRawJVD)) {
        var regexp = /\[\[.+\]\]/g
        dson = await d('_queue')
            .set(null, regexp, async (data) => {
                var fkey = data.value.substr(2, data.value.length - 4)
                // 可能可以加上说明 todo
                return options.functionMap[fkey] || new Error(`jsonify failed :   ${fkey} `)
            })
            .set((key, value) => {
                return uType.isObject(value) && (value.isRawDSON || value.isRawJVD)
            }, null, async data => {
                return await jsonify(data.value, options)
            }).select((data, context) => {
                var temp = dson.isRawDSON ? d() : j()
                temp._queue = data
                return temp
            }).doDraw(json)
    } else if (uType.isObject(dson) || uType.isArray(dson)) {
        var regexp = /\[\[.+\]\]/g
        dson = await d()
            .set(null, regexp, async (data) => {
                var fkey = data.value.substr(2, data.value.length - 4)
                // 可能可以加上说明 todo
                return options.functionMap[fkey] || new Error(`jsonify failed :   ${fkey} `)
            })
            .set((key, value) => {
                return uType.isObject(value) && (value.isRawDSON || value.isRawJVD)
            }, null, async data => {
                return await jsonify(data.value, options)
            })
            .doDraw(dson)
    }

    return dson
}

exports.stringify = async (dson, options) => {
    return JSON.stringify(await rawify(dson, options))
}

exports.parse = async (dsonString, options) => {
    return await jsonify(JSON.parse(dsonString), options)
}




exports.en = exports.encryption = async (pwd ,dson,options) =>{
    var str = await exports.stringify(dson, options)
    if(pwd){
        return aes.en(pwd, str)
    }
    return str
}

exports.de = exports.decrypt = async(pwd, str , options)=>{
    var content = str
    if(pwd){
        content =  aes.de(pwd, str)
    }
    var json = await exports.parse(content,options)
    return json
}