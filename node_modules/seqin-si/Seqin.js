!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'Seqin'    }
  , ID:      { value:'si'       }
  , VERSION: { value:'0.0.13'    }
  , SPEC:    { value:'20170705' }
  , HELP:    { value:
`The base class for all sequencer instruments. It’s not usually used directly -
it just generates silent buffers.` }
}

//// Make available on the window (browser) or global (Node.js)
const SEQIN = ROOT.SEQIN = ROOT.SEQIN || {}


SEQIN.Seqin = class {




    //// PUBLIC
    constructor (config) {

        //
        // //// isReady: will be changed to true when _setup() has completed.
        // Object.defineProperty(this, 'isReady', { value:false, configurable:true, writable:false })

        //// Validate config and record its values as immutable properties.
        if ('object' !== typeof config)
            throw new Error(`Seqin(): config is type ${typeof config} not object`)
        this.validConstructor.forEach( valid => {
            const value = config[valid.name]
            if (typeof value !== valid.type)
                throw new TypeError(`Seqin(): config.${valid.name} is type ${typeof value} not ${valid.type}`)
            if (null != valid.min && valid.min > value)
                throw new RangeError(`Seqin: config.${valid.name} is less than the minimum ${valid.min}`)
            if (null != valid.max && valid.max < value)
                throw new RangeError(`Seqin: config.${valid.name} is greater than the maximum ${valid.max}`)
            if (null != valid.mod && value % valid.mod)
                throw new RangeError(`Seqin: config.${valid.name} leaves a remainder when divided by ${valid.mod}`)
            Object.defineProperty(this, valid.name, { value })
        })

        //// ready: a Promise which resolves when the instance has initialised.
        Object.defineProperty(this, 'ready', { value: this._setup() });
    }


    perform(config) {

        //// Validate the configuration object.
        this._validateCommonPerfom(config)
        this._validateSpecificPerfom(config)
        this._validateEvents(config)

        //// Run _buildBuffers() when this Seqin instance is ready.
        return this.ready.then( () => {
            return this._buildBuffers(config)
        })

    }


    get validConstructor () {
        return [
            { name:'audioContext'    , type:'object' }
          , { name:'sharedCache'     , type:'object' }
          , { name:'samplesPerBuffer', type:'number', min:8, max:96000, mod:1 } // fidelity
          , { name:'sampleRate'      , type:'number', min:22050, max:96000, mod:1 } // developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/OfflineAudioContext
          , { name:'channelCount'    , type:'number', min:1, max:32, mod:1 }
        ]
    }
    get validCommonPerform() {
        return [
            { name:'bufferCount'    , type:'number', min:1, max:65535, mod:1 }
          , { name:'cyclesPerBuffer', type:'number', min:1, max:65535, mod:1 }
          , { name:'isLooping'      , type:'boolean' }
          , { name:'events'         , type:'object' }
        ]
    }
    get validSpecificPerform() {
        return []
    }
    get validEvents() {
        return [
            { name:'down', type:'number', min:0, max:9, mod:1 }
          , { name:'gain', type:'number', min:0, max:9, mod:1 }
        ]
    }




    //// PRIVATE

    _setup () {

        //// setupStart: the time that `new Seqin({...})` was called.
        if (this.setupStart) throw new Error(`Seqin:_setup(): Can only run once`)
        Object.defineProperty(this, 'setupStart', { value:performance.now() })

        //// seqin-si does no setup, so could resolve the `ready` Promise
        //// immediately. However, to make _setup()’s behavior consistent with
        //// Seqins which have a slow async setup, we introduce a short delay.
        return new Promise( (resolve, reject) => {
            setTimeout(
                () => {
                    //// setupEnd: the time that `_setup()` finished running.
                    Object.defineProperty(this, 'setupEnd', { value:performance.now() })
                    //
                    // //// Change isReady to true and make it immutable.
                    // Object.defineProperty(this, 'isReady', { writable:true }) // make writable
                    // Object.defineProperty(this, 'isReady', { value:true, configurable:false, writable:false }) // unwritable and unconfigurable

                    //// Xx.
                    resolve({
                        setupDelay: this.setupEnd - this.setupStart
                    })
                }
              , 5
            )
        })
    }


    _validateCommonPerfom (config) {

        if ('object' !== typeof config)
            throw new Error(`Seqin:_validateCommonPerfom(): config is type ${typeof config} not object`)
        this.validCommonPerform.forEach( valid => {
            const value = config[valid.name]
            if (typeof value !== valid.type)
                throw new TypeError(`Seqin:_validateCommonPerfom(): config.${valid.name} is type ${typeof value} not ${valid.type}`)
            if (null != valid.min && valid.min > value)
                throw new RangeError(`Seqin:_validateCommonPerfom(): config.${valid.name} is less than the minimum ${valid.min}`)
            if (null != valid.max && valid.max < value)
                throw new RangeError(`Seqin:_validateCommonPerfom(): config.${valid.name} is greater than the maximum ${valid.max}`)
            if (null != valid.mod && ((value/valid.mod) % 1))
                throw new RangeError(`Seqin:_validateCommonPerfom(): config.${valid.name} ${value} leaves remainder ${(value/valid.mod) % 1} when divided by ${valid.mod}`)
        })

        //// Seqin only allows waveforms with whole-number lengths.
        const samplesPerCycle = this.samplesPerBuffer / config.cyclesPerBuffer
        if (samplesPerCycle !== ~~samplesPerCycle)
            throw new Error('Seqin:_validateCommonPerfom() samplesPerBuffer/cyclesPerBuffer is not an integer')
    }


    _validateSpecificPerfom (config) {

        this.validSpecificPerform.forEach( valid => {
            const value = config[valid.name]
            if (typeof value !== valid.type)
                throw new TypeError(`Seqin:_validateSpecificPerfom(): config.${valid.name} is type ${typeof value} not ${valid.type}`)
            if (null != valid.min && valid.min > value)
                throw new RangeError(`Seqin:_validateSpecificPerfom(): config.${valid.name} is less than the minimum ${valid.min}`)
            if (null != valid.max && valid.max < value)
                throw new RangeError(`Seqin:_validateSpecificPerfom(): config.${valid.name} is greater than the maximum ${valid.max}`)
            if (null != valid.mod && ((value/valid.mod) % 1))
                throw new RangeError(`Seqin:_validateSpecificPerfom(): config.${valid.name} ${value} leaves remainder ${(value/valid.mod) % 1} when divided by ${valid.mod}`)
        })
    }


    _validateEvents (config) {

        //// Validate the config.events array.
        //// Note that the base Seqin class only creates silent buffers, so the
        //// events don’t make any difference. Validation is included here for
        //// Seqin sub-classes.
        if (! Array.isArray(config.events) )
            throw new Error(`Seqin:_validateCommonPerfom(): config.events is not an array`)
        const validEvents = this.validEvents
        config.events.forEach( (event, i) => {
            if ('object' !== typeof event)
                throw new TypeError(`Seqin:_validateCommonPerfom(): config.events[${i}] is not an object`)
            if ('number' !== typeof event.at)
                throw new TypeError(`Seqin:_validateCommonPerfom(): config.events[${i}].at is not a number`)
            let actionName = null
            validEvents.forEach( valid => {
                const value = event[valid.name]
                if (null == value) return
                if (actionName)
                    throw new Error(`Seqin:_validateCommonPerfom(): config.events[${i}] has more than one action`)
                if (typeof value !== valid.type)
                    throw new TypeError(`Seqin:_validateCommonPerfom(): config.events[${i}].${valid.name} is type ${typeof value} not ${valid.type}`)
                if (null != valid.min && valid.min > value)
                    throw new RangeError(`Seqin:_validateCommonPerfom(): config.events[${i}].${valid.name} is less than the minimum ${valid.min}`)
                if (null != valid.max && valid.max < value)
                    throw new RangeError(`Seqin:_validateCommonPerfom(): config.events[${i}].${valid.name} is greater than the maximum ${valid.max}`)
                if (null != valid.mod && (value/valid.mod) % 1)
                    throw new RangeError(`Seqin:_validateCommonPerfom(): config.events[${i}].${valid.name} ${value} leaves remainder ${(value/valid.mod) % 1} when divided by ${valid.mod}`)
                actionName = valid.name
            })
            if (! actionName)
                throw new Error(`Seqin:_validateCommonPerfom(): config.events[${i}] does not specify an action`)
        })
    }


    _buildBuffers(config) {

        //// The base Seqin class just returns silence.
        const buffers = []
        for (let i=0; i<config.bufferCount; i++) {
            buffers.push({
                id:   'si' // always silence, so always the same cache-identifier
              , data: this.audioContext.createBuffer( //@TODO start using sharedCache
                    this.channelCount     // numOfChannels
                  , this.samplesPerBuffer // length
                  , this.sampleRate       // sampleRate
                )
            }) // developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBuffer#Syntax
        }

        //// Return the silent buffers.
        return Promise.resolve(buffers)
    }

}//Seqin


//// Add static constants to the Seqin class.
Object.defineProperties(SEQIN.Seqin, META)


}( 'object' === typeof window ? window : global )
