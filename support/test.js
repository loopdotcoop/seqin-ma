//// This is the test entry-point for Node.js.
//// You’ll need to install mocha and chai first.

//// Define `TestClassName` and `TestMeta` for './test-common-isomorphic.js'.
global.TestClassName = 'MathSeqin'
global.TestMeta = {
//// This has been copy-pasted from the main script:
    NAME:    { value:'MathSeqin' }
  , ID:      { value:'ma'        }
  , VERSION: { value:'0.0.2'     }
  , SPEC:    { value:'20170705'  }
  , HELP:    { value:
`The base class for all mathematical Seqins. It’s not usually used directly -
it just generates basic sine waves.` }
}

//// Load Seqin, the base class.
require('seqin-si')

//// Load the class to be tested.
require('../'+global.TestClassName)

//// Run the tests.
require('seqin-si/support/test-common-isomorphic')
//@TODO './test-specific-isomorphic'
