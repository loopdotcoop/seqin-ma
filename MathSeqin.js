!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'MathSeqin' }
  , ID:      { value:'ma'        }
  , VERSION: { value:'0.0.7'     }
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


    //// Expect ADSR settings in the constructor()’s configuration.
    get validConstructor () {
        return super.validConstructor.concat(
            { name:'attackDuration' , type:'number', min:8, max:96000 , mod:1, default:300 }
          , { name:'decayDuration'  , type:'number', min:8, max:96000 , mod:1, default:900 }
          , { name:'releaseDuration', type:'number', min:8, max:960000, mod:1, default:1000 }
        )
    }


    //// PRIVATE MEMBERS
    //// ---------------

    //// CONTROLLER
    //// _buildBuffers()

    //// SINGLE WAVEFORM
    //// _getSingleWaveformBuffer()
    //// _getSingleWaveformId()
    //// _renderSingleWaveformBuffer()

    //// OSCILLATION
    //// _getOscillationBuffer()
    //// _getOscillationId()
    //// _renderOscillationBuffer()

    //// GAIN ENVELOPE
    //// _getGainEnvelopeBuffer()
    //// _getGainEnvelopeId()
    //// _renderGainEnvelopeBuffer()

    //// ENVELOPE NODES
    //// _eventsToEnvelopeNodes
    //// _getReducedEnvelopeNodes




    //// CONTROLLER

    //// Coordinates the process of creating an array of audio buffers. Returns
    //// a Promise which resolves to an array of output-buffers. It also may add
    //// various kinds of buffers to the shared-cache.
    //// Called by: perform()
    _buildBuffers (config) {

        //// Get empty buffers from Seqin, and then fill them with audio.
        return super._buildBuffers(config).then( outputBuffers => {

            //// Translate config.events to an array of ADSR envelope nodes.
            const envelopeNodes = this._eventsToEnvelopeNodes(config)
            outputBuffers.envelopeNodes = envelopeNodes // helpful for Seqinalysis

            //// Return the filled buffers.
            return new Promise( (resolve, reject) => {

                //// MathSeqin audio is built from a single waveform, repeated
                //// for the length of the buffer.
                this._getSingleWaveformBuffer(config)
                   .then( singleWaveformBuffer => {
                        return this._getOscillationBuffer(config, singleWaveformBuffer)
                    })
                   .then( oscillationBuffer => {

                        //// Fill each output-buffer with finished audio.
                        outputBuffers.forEach( (outputBuffer, i) => {

                            //// Get each output-buffer’s `reducedEnvelopeNodes` array.
                            const rens = this._getReducedEnvelopeNodes(config, envelopeNodes, i)

                            //// Apply the ADSR envelope to each oscillation-buffer and
                            //// then copy the result into the silent buffers.
                            this._getGainEnvelopeBuffer(config, rens, oscillationBuffer, outputBuffer)
                               .then( gainEnvelopeBuffer => {
                                    outputBuffer.data = gainEnvelopeBuffer
                                    outputBuffer.hasRendered = true
                                    if ( outputBuffers.every(buf => buf.hasRendered) )
                                        resolve(outputBuffers)
                                })
                        })

                    })

            })
        })

    }




    //// SINGLE WAVEFORM

    //// Returns a single-waveform buffer - from the cache, or generated.
    //// Called by: perform() > _buildBuffers()
    _getSingleWaveformBuffer (config) {

        //// Get the ID, which is based entirely on audio parameters.
        const singleWaveformId = this._getSingleWaveformId(config)

        //// Use the cached buffer if available.
        if (this.sharedCache[singleWaveformId])
            return Promise.resolve(this.sharedCache[singleWaveformId])

        //// Otherwise create an empty buffer, fill it with values...
        return this._renderSingleWaveformBuffer(config)
           .then( singleWaveformBuffer => {

                //// ...add a reference to any arbitrary metadata...
                singleWaveformBuffer.meta = config.meta || {}

                //// ...cache it and return it.
                this.sharedCache[singleWaveformId] = singleWaveformBuffer
                return singleWaveformBuffer
           })
    }


    //// Returns a single-waveform ID, based on config passed to `perform()`,
    //// and also config passed to `constructor()`.
    //// Called by: perform() > _buildBuffers() > _getSingleWaveformBuffer()
    _getSingleWaveformId (config) {
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        return [
            this.constructor.ID   // universally unique ID for the current class
          , 'SW'                  // denotes a single-waveform cycle
          , 'r'+this.sampleRate   // sample-frames per second
          , 'c'+this.channelCount // number of channels
          , 'w'+samplesPerCycle   // wavelength of the waveform-cycle in sample-frames
        ].join('_')
    }


    //// Returns a new single-waveform buffer, filled with sample-values. This
    //// is the method which actually makes the waveform - you should override
    //// it if you don’t want a sine wave.
    //// Called by: perform() > _buildBuffers() > _getSingleWaveformBuffer()
    _renderSingleWaveformBuffer (config) {
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        const f = Math.PI * 2 / samplesPerCycle // frequency
        const singleWaveformBuffer = this.audioContext.createBuffer(
                this.channelCount // numOfChannels
              , samplesPerCycle   // length
              , this.sampleRate   // sampleRate
            )
        for (let channel=0; channel<this.channelCount; channel++) {
            const singleWaveformChannel = singleWaveformBuffer.getChannelData(channel)
            for (let i=0; i<samplesPerCycle; i++)
                singleWaveformChannel[i] = Math.sin(i * f)
        }
        return Promise.resolve(singleWaveformBuffer)
    }




    //// OSCILLATION

    //// Returns an oscillation buffer - from the cache, or generated.
    //// Called by: perform() > _buildBuffers()
    _getOscillationBuffer (config, singleWaveformBuffer) {

        //// Get the ID, which is based entirely on audio parameters.
        const oscillationId = this._getOscillationId(config)

        //// Use the cached buffer if available.
        if (this.sharedCache[oscillationId])
            return Promise.resolve(this.sharedCache[oscillationId])

        //// Otherwise create an empty buffer, fill it with values...
        return this._renderOscillationBuffer(config, singleWaveformBuffer)
           .then( oscillationBuffer => {

                //// ...add a reference to any arbitrary metadata...
                oscillationBuffer.meta = config.meta || {}

                //// ...cache it and return it.
                this.sharedCache[oscillationId] = oscillationBuffer
                return oscillationBuffer
           })
    }


    //// Returns an oscillation ID, based on config passed to `perform()`,
    //// and also config passed to `constructor()`.
    //// Called by: perform() > _buildBuffers() > _getOscillationBuffer()
    _getOscillationId (config) {
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        return [
            this.constructor.ID       // universally unique ID for the current class
          , 'OS'                      // denotes an oscillation buffer
          , 'b'+this.samplesPerBuffer // number of sample-frames in each buffer
          , 'r'+this.sampleRate       // sample-frames per second
          , 'c'+this.channelCount     // number of channels
          , 'w'+samplesPerCycle       // wavelength of the waveform-cycles in sample-frames
        ].join('_')
    }



    //// Returns a new oscillation buffer, filled with repeated single-waveform
    //// buffers.
    //// Called by: perform() > _buildBuffers() > _getOscillationBuffer()
    _renderOscillationBuffer (config, singleWaveformBuffer) {
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        const oscillationBuffer
          = this.audioContext.createBuffer(
                this.channelCount     // numOfChannels
              , this.samplesPerBuffer // length
              , this.sampleRate       // sampleRate
            )
        for (let channel=0; channel<this.channelCount; channel++) {
            const singleWaveformChannel = singleWaveformBuffer.getChannelData(channel)
            const oscillationChannel = oscillationBuffer.getChannelData(channel)
            for (let i=0; i<this.samplesPerBuffer; i++) {
                oscillationChannel[i] = singleWaveformChannel[i % samplesPerCycle]
            }//@TODO find a faster technique for duplicating audio
        }
        return Promise.resolve(oscillationBuffer)
    }




    //// GAIN ENVELOPE

    //// Returns a gain-envelope buffer - from the cache, or generated.
    //// Called by: perform() > _buildBuffers()
    _getGainEnvelopeBuffer (config, rens, oscillationBuffer, outputBuffer) {

        //// Silent buffers are not kept in the cache.
        if (2 === rens.length && 0 === rens[0].level && 0 === rens[1].level)
            return Promise.resolve(outputBuffer.data)

        //// Get the ID, which is based entirely on audio parameters.
        const gainEnvelopeId = this._getGainEnvelopeId(config, rens)

        //// Use the cached buffer if available.
        if (this.sharedCache[gainEnvelopeId])
            return Promise.resolve(this.sharedCache[gainEnvelopeId])

        //// Otherwise, render the ADSR envelope ‘offline’...
        return this._renderGainEnvelopeBuffer(oscillationBuffer, rens)
           .then( gainEnvelopeBuffer => {

                //// ...add a reference to arbitrary metadata, etc...
                gainEnvelopeBuffer.meta = config.meta || {}
                gainEnvelopeBuffer.reducedEnvelopeNodes = rens // helpful for Seqinalysis
                gainEnvelopeBuffer.id = gainEnvelopeId

                //// ...store it in the cache and return it.
                this.sharedCache[gainEnvelopeId] = gainEnvelopeBuffer
                return gainEnvelopeBuffer
            })
    }


    //// Returns a gain-envelope ID, based on config passed to `perform()`,
    //// and also config passed to `constructor()`.
    //// Called by: perform() > _buildBuffers() > _getGainEnvelopeBuffer()
    _getGainEnvelopeId (config, rens) {
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer

        //// The ID’s start does not depend on the buffer’s ADSR envelope.
        let gainEnvelopeId = [
            this.constructor.ID       // universally unique ID for the current class
          , 'GE'                      // denotes a buffer with a gain-envelope applied
          , 'b'+this.samplesPerBuffer // number of sample-frames in each buffer
          , 'r'+this.sampleRate       // sample-frames per second
          , 'c'+this.channelCount     // number of channels
          , 'w'+samplesPerCycle+'_'   // wavelength of the waveform-cycle in sample-frames
        ].join('_')

        //// Deal with a simple horizontal level.
        if (2 === rens.length && rens[0].level === rens[1].level)
            return gainEnvelopeId += 'g' + rens[0].level // eg '..._g4' if it stays at level 4

        //// Deal with a simple diagonal level.
        if (2 === rens.length && 0 === rens[0].at && this.samplesPerBuffer === rens[1].at)
            return gainEnvelopeId += 'g' + rens[0].level + 'L' + rens[1].level // eg '..._g4L0' if it’s level 4 at 0, and level 0 on the last sample-frame

        //// Look for greatest common denominator in all 'at' values.
        let gcd = (a, b) => b ? gcd(b, a % b) : a
          , ats = rens.map(n => n.at) // eg `[24,12,3,15,30,60]` would be `3`
          , a = ats[0]
        for (let i=0, b; i<ats.length; i++)
            if ( null != (b = ats[i+1]) )
                a = gcd(a, b)
        const grid = Math.abs(a)
        gainEnvelopeId += (1 === grid ? '' : grid) + 'g' // eg '..._1000g' for a 6000-samplesPerBuffer buffer chopped into 6 imaginary peices

        //// The first node’s 'at' is always zero or negative. If it’s zero we
        //// leave it out. If it’s negative we chop off the minus sign.
        if (0 < rens[0].at)
            throw new Error(`MathSeqin:_getGainEnvelopeId(): Unreachable?! The first node shouldn’t be able to be at ${rens[0].at}!`)
        if (0 > rens[0].at)
            gainEnvelopeId += rens[0].at / -grid

        //// Add the first nodes’s level.
        gainEnvelopeId += rens[0].level

        //// Add the grid-aware 'at', and also the level, for each inner-node.
        for (let i=1; i<rens.length-1; i++)
            gainEnvelopeId += `L${rens[i].at/grid}${rens[i].level}` // 'L' means 'draw a linear line to'

        //// The rightmost node’s 'at' can be left out if it sits exactly on the
        //// sample-frame at the start of the following buffer.
        const rrn = rens[rens.length-1]
        if (this.samplesPerBuffer > rrn.at)
            throw new Error(`MathSeqin:_getGainEnvelopeId: Unreachable?! The last node shouldn’t be able to be at ${rrn.at}!`)
        if (this.samplesPerBuffer === rrn.at)
            return gainEnvelopeId += `L${rrn.level}`
        return gainEnvelopeId += `L${rrn.at/grid}${rrn.level}`
    }


    //// Returns a new audio buffer, which is the result of combining an
    //// oscillation buffer with a ‘reduced’ array of gain-nodes.
    //// Called by: perform() > _buildBuffers() > _getGainEnvelopeBuffer()
    _renderGainEnvelopeBuffer (oscillationBuffer, rens) {
        const offlineCtx = new OfflineAudioContext(
            this.channelCount     // numOfChannels
          , this.samplesPerBuffer // length
          , this.sampleRate       // sampleRate
        )

        //// Create a gain node and set its initial gain value.
        const gainNode = offlineCtx.createGain()

        //// Connect the oscillation AudioBuffer to the gainNode, and the
        //// gainNode to the destination.
        const source = offlineCtx.createBufferSource()
        source.buffer = oscillationBuffer
        source.connect(gainNode)
        gainNode.connect(offlineCtx.destination)

        //// The first gain-node’s time-position is either zero or negative.
        //// If negative, calculate the level at sample-frame zero.
        let initialLevel = 0 === rens[0].at
          ? rens[0].level
          : (
                (rens[1].at / (rens[1].at-rens[0].at)) // ratio, where the triangle’s base crosses the origin
              * (rens[0].level - rens[1].level)       // multiply by the triangle’s height (negative if upwards slope)
              + rens[1].level                        // add the height of the rightmost node
            )

        //// Set the initial gain node, and schedule the rest.
        // gainNode.gain.value = initialLevel / 9 // a value between 0 and 9 @TODO remove this line if no browsers need it
        gainNode.gain.setValueAtTime(initialLevel / 9, offlineCtx.currentTime)
        for (let j=1; j<rens.length; j++) // note `j=1`
            gainNode.gain.linearRampToValueAtTime(
                rens[j].level / 9 // 'level' is a value between 0 and 9
              , (rens[j].at / this.sampleRate) + offlineCtx.currentTime
            )

        //// `startRendering()` returns a Promise.
        source.start()
        return offlineCtx.startRendering()
    }




    //// ENVELOPE NODES

    //// Reads config.events, and returns an array of ADSR envelope nodes.
    //// Called by: perform() > _buildBuffers()
    _eventsToEnvelopeNodes (config) {

        //// Sort the events in time-order.
        config.events.sort( (a, b) => a.at - b.at )

        //// The MathSeqin implementation of _eventsToEnvelopeNodes() only
        //// understands a simple down-up pair of events.
        if (2 !== config.events.length)
            throw new Error(`MathSeqin:_eventsToEnvelopeNodes(): config.events must contain exactly 2 events, not ${config.events.length}`)
        if (! config.events[0].down)
            throw new Error(`MathSeqin:_eventsToEnvelopeNodes(): config.events[0] must have a 'down' property`)
        if (0 !== config.events[1].down)
            throw new Error(`MathSeqin:_eventsToEnvelopeNodes(): config.events[1].down must be 0, not ${config.events[1].down}`)

        //// Convert the pair of events into five ADSR times. Note that
        //// releaseStart will not begin before sustainStart.
        const
            attackStart  =                config.events[0].at
          , decayStart   = attackStart  + this.attackDuration
          , sustainStart = decayStart   + this.decayDuration
          , releaseStart = Math.max(config.events[1].at, sustainStart)
          , releaseEnd   = releaseStart + this.releaseDuration

        //// The gain levels at decayStart and sustainStart are integers, 0-9.
        const attackLevel = config.events[0].down
        const sustainLevel = Math.ceil(config.events[0].down / 2)

        //// Convert the five ADSR times to a list of ADSR nodes. `filter(...)`
        //// removes duplicate nodes - eg sustainStart and releaseStart will be
        //// duplicates if `releaseStart - attackStart` is less than
        //// `attackDuration + decayDuration`.
        const envelopeNodes = [
                { at:attackStart,  level:0            } // start of attack
              , { at:decayStart,   level:attackLevel  } // start of decay
              , { at:sustainStart, level:sustainLevel } // start of sustain
              , { at:releaseStart, level:sustainLevel } // start of release
              , { at:releaseEnd,   level:0            } // end of release
            ].filter( (node, i, self) => i === self.findIndex(
                n => n.at === node.at && n.level === node.level
            ) )

        //// If the attack is not scheduled to start on the first sample-frame,
        //// insert an ADSR node with zero-level there.
        if (0 !== attackStart)
            envelopeNodes.unshift({ at:0, level:0 })

        //// If the end-of-release node is placed on or before the the last
        //// buffer’s final sample-frame, insert a zero-level node after it.
        const endSampleFramePlusOne = config.bufferCount * this.samplesPerBuffer
        if (releaseEnd < endSampleFramePlusOne)
            envelopeNodes.push({ at:endSampleFramePlusOne, level:0 })

        return envelopeNodes
    }


    //// The overall ADSR envelope generated by _eventsToEnvelopeNodes() will
    //// usually need to be split into several sub-envelopes - one for each
    //// buffer. This method creates a buffer’s `reducedEnvelopeNodes` array.
    //// Called by: perform() > _buildBuffers()
    _getReducedEnvelopeNodes (config, envelopeNodes, i) {

        //// Get this buffer’s first and last sample-frame.
        const first = this.samplesPerBuffer * i
        const last  = this.samplesPerBuffer * i + this.samplesPerBuffer - 1

        //// Determine which ADSR nodes have an effect on this buffer.
        let before, inner = [], after
        for (let j=0; j<envelopeNodes.length; j++) {
            const { at, level } = envelopeNodes[j]
            if (first >= at)
                before = { at, level } // last node before the buffer begins
            else if (last > at)
                inner.push({ at, level }) // a node somewhere in the middle of the buffer
            else {
                after = { at, level } // first node after the buffer ends
                break
            }
        }

        const rightOfBefore = inner[0] || after
        const leftOfAfter = inner[inner.length-1] || before

        //// Where a level enters the buffer horizontally...
        if (before.level === rightOfBefore.level)
            before.at = first // ...trim `before.at`

        //// Where a level exits the buffer horizontally...
        if (after.level === leftOfAfter.level)
            after.at = last+1 // ...trim `after.at`

        ////@TODO trim where angles cut across buffer-boundaries at precisely integer values

        //// Attach the reduced ADSR nodes to the buffer, with 'at' values
        //// converted from absolute to relative.
        return [ before ].concat(inner).concat(after)
           .map( n => ({ at: n.at -= first, level:n.level }) )
    }


}


//// Add static constants to the MathSeqin class.
Object.defineProperties(SEQIN.MathSeqin, META)


}( 'object' === typeof window ? window : global )
