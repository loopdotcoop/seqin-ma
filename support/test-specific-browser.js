//// 'specific', because these tests will only run on this package’s class.

//// 'browser', because these tests need a fully functional AudioContext. That
//// means they’ll only run in the browser, not Node.js.

!function (ROOT) {

const
    a         = chai.assert
  , expect    = chai.expect
  , eq        = a.strictEqual

    //// To test a `Seqin` subclass called `MyGreatSeqin`, you should have set:
    //// window.TestClassName = 'MyGreatSeqin'
  , TestClass = SEQIN[ROOT.TestClassName]


describe(`Test specific browser '${ROOT.TestClassName}'`, () => {

	describe('getBuffers() result', () => {
        const ctx = new AudioContext()
        const cache = {}
        const testInstance = new TestClass({
            audioContext:     ctx
          , sharedCache:      cache
          , samplesPerBuffer: 2340
          , sampleRate:       23400
          , channelCount:     1
        })
        const buffers = testInstance.getBuffers({
            bufferCount:     8
          , cyclesPerBuffer: 234
          , isLooping:       true
          , events:          []
        })

    	it(`Buffers should contain expected data`, () => {
            buffers.forEach( (buffer,i) => {
                eq( buffer.id, 'ma', `buffers[${i}].id is incorrect` )
                const channelData = buffer.data.getChannelData(0) //@TODO test multiple channels
                // if (0==i) {
                //     const ui8 = new Uint8Array(channelData.buffer);
                //     console.log('first two F32', channelData.slice(0,2));
                //     console.log('first eight UI8', ui8.slice(0,8));
                //     console.log('last two F32', channelData.slice(-2));
                //     console.log('last eight UI8', ui8.slice(-8));
                // }
                const hash = asmCrypto.SHA256.hex( new Uint8Array(channelData.buffer) )
                eq(
                    hash
                  , 'ee717c99bef3b7ed1dc2cbbe90cbde843c7a0739183370738914426096de6000'
                  , `buffers[${i}].data.getChannelData(0) has incorrect hash`
                )

                // console.log(hash)
            })
    	})


    })

})

}( 'object' === typeof window ? window : global )
