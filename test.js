var paser = require('./')
var  d = require('dson.js').DSON
var j = require('dson.js').JVD


var it2 = global.debug || it



it('test easy stringify', async () => {

    var json = {
        hello: 'world',
        fun: () => {}
    }
    var options = {}
    await paser.stringify(json, options)
    expect(options.functionMap['fun']).toBe(json.fun)
})

it('test stringify' , async()=>{
    var fm = {
        m1 : ()=> { return 1},
        m2 : () =>{return 2},
        m3 : ()=> { return 3},
        m4 : /abc/g,
        m5 : async ()=>{ return 5}
    }
    var json = {
        hello : 'good good day',
        c1 : fm.m1,
        c4 : fm.m4,
        c5 : fm.m5,
        c6 :  ()=>{},
        m5 : /adf/g,
        d : d().get({ hello : 1 , hello1 : ()=>{}}).mark('m1').get(()=>{})
    }
    var options = {initFunctionMap : fm , functionMap : { abc : fm.m4}}
    var string = await paser.stringify(json,options)
    var nj = JSON.parse(string)
    expect(nj.c1).toBe('[[m1]]')
    expect(nj.c6).toBe('[[c6]]')
    expect(nj.m5).toBe('[[auto2]]')
    expect(nj.c4).toBe('[[abc]]')
    expect(options.functionMap.m5).toBe(fm.m5)
    expect(nj.d.isRawDSON).toBe(true)
    expect(nj.d._queue.length).toBe(3)

    var string2 = await paser.stringify(d().select(fm.m1).mark('hello').format({ hello : fm.m3}).expect(d().select({ yes : 'your highness'})).test(j('>2')) , options)
    var nj2 = JSON.parse(string2)

    expect(nj2._queue[0].params[0]).toBe('[[m1]]')

    expect(nj2._queue[3].params[0].isRawDSON).toBe(true)

    expect(nj2._queue[4].params[0].isRawJVD).toBe(true)
})



it2('test parse' , async () =>{
     var json = {
        hello : 'good good day',
        fn : ()=>{}
     }
     var options = {}
     var nj =  await paser.parse( await paser.stringify(json,options) , options)

     expect(json.fn == nj.fn && nj.hello == 'good good day').toBe(true)

     var testJson = {
         name : 'LiSA',
         profile : {
             job : 'sing',
             goodat : [
                 'shirushi' , 'ADAMAS','ash'
             ]
         }
     }
     var dson = d().get('profile.goodat[2]').mark('ash').root().get('name').mark('name').format({
         name : '${name}',
         goodat : '${ash}'
     } , { ash : 'it is ash'}).mark('format')
     .root().select(data=>{ return data.goodat}).test("='it is ash'").goto('name')

     expect(await dson.doTest(testJson)).toBe(false)
     expect(await dson.doDraw(testJson)).toBe('LiSA')

     var options2= {}
     var nDson = await paser.parse( await paser.stringify(dson,options2), options2)

     expect(await nDson.doTest(testJson)).toBe(false)
     expect(await nDson.doDraw(testJson)).toBe('LiSA')
})



it2('test encypt' , async () =>{
    var json = {
       hello : 'good good day',
       fn : ()=>{}
    }
    var options = {}
    var nj =  await paser.parse( await paser.stringify(json,options) , options)

    expect(json.fn == nj.fn && nj.hello == 'good good day').toBe(true)

    var testJson = {
        name : 'LiSA',
        profile : {
            job : 'sing',
            goodat : [
                'shirushi' , 'ADAMAS','ash'
            ]
        }
    }
    var dson = d().get('profile.goodat[2]').mark('ash').root().get('name').mark('name').format({
        name : '${name}',
        goodat : '${ash}'
    } , { ash : 'it is ash'}).mark('format')
    .root().select(data=>{ return data.goodat}).test("='it is ash'").goto('name')

    expect(await dson.doTest(testJson)).toBe(false)
    expect(await dson.doDraw(testJson)).toBe('LiSA')

    var options2= {}
    var en = await paser.en( 'abc',dson,options2)
    console.log(en)
    var nDson = await paser.de( 'abc',en, options2)

    expect(await nDson.doTest(testJson)).toBe(false)
    expect(await nDson.doDraw(testJson)).toBe('LiSA')
})