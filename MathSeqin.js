!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'MathSeqin' }
  , ID:      { value:'ma'        }
  , VERSION: { value:'0.0.3'     }
  , SPEC:    { value:'20170705'  }
  , HELP:    { value:
`The base class for all mathematical Seqins. It’s not usually used directly -
it just generates silent buffers.` }
}

//// Make available on the window (browser) or global (Node.js)
const SEQIN = ROOT.SEQIN
if (! SEQIN)       throw new Error('The SEQIN global object does not exist')
if (! SEQIN.Seqin) throw new Error('The base SEQIN.Seqin class does not exist')


SEQIN.MathSeqin = class extends SEQIN.Seqin {

    constructor (config) {
        super(config)
    }


    getBuffers(config) {

        //// Validate config and get empty buffers.
        const buffers = super.getBuffers(config)

        //// The MathSeqin class just keeps the base Seqin class’s silence.
        buffers.map( buffer => {
            buffer.id = 'ma'
        })

        return buffers
    }

}


//// Add static constants to the MathSeqin class.
Object.defineProperties(SEQIN.MathSeqin, META)


}( 'object' === typeof window ? window : global )
