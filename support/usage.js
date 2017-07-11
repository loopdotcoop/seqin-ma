//// Xx.
!function (ROOT) {

const
    d = document
  , $ = (s) => d.querySelector.call(d, s)

let $out, $canvas, canvasCtx, audioCtx, mathSeqin

ROOT.usage = {

    //// Initialises the app.
    init: () => {

        //// Create the <canvas> element.
        $out = $('#usage')
        $canvas = document.createElement('canvas')
        $canvas.width = 900
        $canvas.height = 100
        $out.appendChild($canvas)
        canvasCtx = $canvas.getContext('2d')

        //// Set up audio.
        audioCtx = new AudioContext()
        mathSeqin = new SEQIN.MathSeqin({
            audioContext: audioCtx
          , sharedCache: {}
          , samplesPerBuffer: 900
          , sampleRate: 44100
          , channelCount: 1
        })
    }


    //// A button generates and plays a note, and draws its waveform.
  , addButton: (config) => {

        //// Create the button.
        const $button = d.createElement('button')
        $button.innerHTML = config.text
        $button.style.color = `rgb(${config.red||0},${config.green||0},${config.blue||0})`
        $out.appendChild($button)

        //// Deal with a click.
        $button.onclick = () => {

            //// Generate the note.
            const buffers = mathSeqin.getBuffers({
                bufferCount: 1
              , cyclesPerBuffer: config.cyclesPerBuffer
              , isLooping: false
              , events: [
                    { at:0, down:config.velocity }
                  , { at:900, up:1 }
                ]
            })

            //// Draw the note’s waveform.
            const dot = canvasCtx.createImageData(1,1)
            dot.data[0] = config.red || 0 // red
            dot.data[1] = config.green || 0 // green
            dot.data[2] = config.blue || 0 // blue
            dot.data[3] = 255 // 100% opacity
            const channelBuffer = buffers[0].data.getChannelData(0)
            for (let x=0; x<900; x++) {
                canvasCtx.putImageData(
                    dot
                  , x
                  , channelBuffer[x] * -50 + 50 // y position
                )
            }

            //// Play the note.
            const src = audioCtx.createBufferSource()
            src.buffer = buffers[0].data
            src.connect(audioCtx.destination)
            src.start(0)
        }
    }

}


}( 'object' === typeof window ? window : global )
