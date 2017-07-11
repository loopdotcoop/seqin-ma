!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'MathSeqin' }
  , ID:      { value:'ma'        }
  , VERSION: { value:'0.0.2'     }
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
        super(config)
    }


    getBuffers(config) {

        //// Validate config and get empty buffers.
        const buffers = super.getBuffers(config)

        //// MathSeqin notes are built from a single waveform. Its ID is:
        const waveformId =
            'w-'  // denotes a waveform
          + 'ma-' // universally unique ID for MathSeqin
          + 'l' // universally unique ID for MathSeqin

        //// Check the cache for the requested waveform.
        let waveform = this.sharedCache['ma-']

        //// The MathSeqin class generates a basic sine wave.
        const f = Math.PI * 2 * config.cyclesPerBuffer / this.samplesPerBuffer
        buffers.map( buffer => {
            buffer.id = 'ma'
            for (let channel=0; channel<this.channelCount; channel++) {
                const channelBuffer = buffer.data.getChannelData(channel)
                for (let i=0; i<this.samplesPerBuffer; i++) {
                    channelBuffer[i] = Math.sin(i * f)
                }
            }
        })

        return buffers

    }

}


//// Add static constants to the MathSeqin class.
Object.defineProperties(SEQIN.MathSeqin, META)


}( 'object' === typeof window ? window : global )
