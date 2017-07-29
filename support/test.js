//// This is the test entry-point for Node.js.
//// You’ll need to install mocha and chai first:
//// $ npm install mocha --global
//// $ npm install chai --global

//// Define `TestMeta` - this has been copied from the main script.
global.TestMeta = {
    NAME:    { value:'MathSeqin' }
  , ID:      { value:'ma'        }
  , VERSION: { value:'1.0.1'     }
  , SPEC:    { value:'20170728'  }
  , HELP:    { value:
`The base class for all mathematical Seqins. It generates sine waves with ADSR envelopes.` }
}

//// Polyfill `performance.now()` and define a dummy `AudioContext`.
global.performance = {
    now: () => { const hr = process.hrtime(); return hr[0] * 1e4 + hr[1] / 1e6 }
}
global.AudioContext = class AudioContext {}
global.AudioContext.prototype.sampleRate = 48000

//// Load Seqin, the base class.
require('seqin-base')

//// Load the class to be tested.
require('../seqin-'+global.TestMeta.ID.value)

//// Run the tests.
require('seqin-base/support/test-base-isomorphic')
require('./test-family-isomorphic')
