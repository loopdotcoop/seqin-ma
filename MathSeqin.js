!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'MathSeqin' }
  , ID:      { value:'ma'        }
  , VERSION: { value:'0.0.1'     }
  , SPEC:    { value:'20170705'  }
  , HELP:    { value:
`The base class for all mathematical Seqins. It’s not usually used directly -
it just generates basic sine waves.` }
}

//// Make available on the window (browser) or global (Node.js)
const SEQIN = ROOT.SEQIN
if (! SEQIN)       throw new Error('The SEQIN global object does not exist')
if (! SEQIN.Seqin) throw new Error('The base SEQIN.Seqin class does not exist')


SEQIN.MathSeqin = class extends SEQIN.Seqin {

    constructor (config) {

    }

}


//// Add static constants to the MathSeqin class.
Object.defineProperties(SEQIN.MathSeqin, META)


}( 'object' === typeof window ? window : global )
