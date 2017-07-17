//// This is the test entry-point for Node.js.
//// You’ll need to install mocha and chai first.

//// Define `TestClassName` and `TestMeta` for './test-common-isomorphic.js'.
global.TestClassName = 'Seqin'
global.TestMeta = {
//// This has been copy-pasted from the main script:
    NAME:    { value:'Seqin'    }
  , ID:      { value:'si'       }
  , VERSION: { value:'0.0.10'    }
  , SPEC:    { value:'20170705' }
  , HELP:    { value:
`The base class for all sequencer instruments. It’s not usually used directly -
it just generates silent buffers.` }
}

//// Polyfill `performance.now()`.
global.performance = {
    now: () => { const hr = process.hrtime(); return hr[0] * 1e4 + hr[1] / 1e6 }
}

//// Load the class to be tested.
require('../'+global.TestClassName)

//// Run the tests.
require('./test-common-isomorphic')
//@TODO './test-specific-isomorphic'
