//// 'family', because these tests can be run unmodified by all sub-classes,
//// whether they’re third-tier (extend MathSeqin directly), or fourth-tier
//// (extend a third-tier Seqin), or fifth-tier, etc.

//// 'isomorphic', because these tests will run in the browser or in Node.js.

!function (ROOT) {

const
    isBrowser = 'object' === typeof window
  , a         = isBrowser ? chai.assert : require('chai').assert
  , expect    = isBrowser ? chai.expect : require('chai').expect
  , eq        = a.strictEqual
  , ok        = a.isOk

    //// To test a `Seqin` subclass called `MyGreatSeqin`, you should have set:
    //// window.TestMeta = { // replace `window` with `global` for Node.js
    ////     NAME:    { value:'MyGreatSeqin' }
    ////   , ID:      { value:'mygt'         }
    ////   , VERSION: { value:'1.2.3'        }
    ////   , SPEC:    { value:'20170728'     }
    ////   , HELP:    { value: 'This is literally the best Seqin ever made!' }
    //// }
  , TestMeta = ROOT.TestMeta
  , TestClassName = TestMeta.NAME.value
  , TestClass = SEQIN[TestClassName]

  , ctx       = new (ROOT.AudioContext||ROOT.webkitAudioContext)()
  , cache     = {}


describe(`Test family isomorphic '${TestClassName}'`, () => {
    it(`@TODO Add the family isomorphic tests in here`, () => {
    })
})

}( 'object' === typeof window ? window : global )
