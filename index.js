// NOW DOING:
// waveform manipulation (asdr) for individual oscillators
// gain sliders not working right; i think there's an extra node hanging out somewhere
// fix: behavior differs between click+slide vs. click on gain sliders

// TODO:
// logarithmic release slider
// clear unused nodes on note end
// investigate beating
// ~ o s c i l l o s c o p e ~
// fix static on gain slider change
// effects
// lfo
// EQ/filters
// microtonality?
// user login
// beginner-friendly illustrations and self-guiding UI
// sequencer
// play more than 6 notes at a time?
// stereo? spatial??
// fix browser tab change bug (audio still plays)
// arpeggiator
// record output
// note repeat
// remove unused gain node on note end
// refactor: fix ungainly (pun very much intended) `node.gain_node.gain` situation

// IDEAS:
// target ed space? younger audience?
// display held down keys in visual representation (qwerty? piano? both?)
// calculate chord from held notes and display it
// incorporate sequencer, etc
// maybe similar target audience to hookpad
// trackpad as xy manipulator for pitch, other params

const keyboard = {
    "a": {freq: 262, down: false}, 
    "w": {freq: 277, down: false}, 
    "s": {freq: 294, down: false}, 
    "e": {freq: 311, down: false}, 
    "d": {freq: 330, down: false}, 
    "f": {freq: 349, down: false}, 
    "t": {freq: 370, down: false},
    "g": {freq: 392, down: false}, 
    "y": {freq: 415, down: false}, 
    "h": {freq: 440, down: false}, 
    "u": {freq: 466, down: false}, 
    "j": {freq: 494, down: false}, 
    "k": {freq: 523, down: false}, 
    "o": {freq: 554, down: false}, 
    "l": {freq: 587, down: false}, 
    "p": {freq: 622, down: false}, 
    ";": {freq: 659, down: false}, 
    "'": {freq: 698, down: false},
}
const audioContext = new AudioContext()
// global oscillators array stores the state of oscillator objects
const oscillators = []
// global nodes array stores the state of OscillatorNodes and GainNodes (linked in pairs)
const nodes = []

fetch("http://localhost:4000/patches")
.then(res => res.json())
.then(data => initializePatches(data))

function initializePatches(data) {
    const patchBank = document.getElementById("patch-bank")
    data.forEach(patch => {
        const patchItem = document.createElement("div")
        patchItem.textContent = patch.name
        patchBank.append(patchItem)
        patchItem.addEventListener("click", e => {
            loadPatch(patch)
        })
    })
    loadPatch(data[0])
}

function loadPatch(patch) {
    const patchTitle = document.getElementById("patch-title")
    patchTitle.textContent = patch.name

    oscillators.length = 0

    patch.oscillators.forEach(osc => {
        const typeSelect = document.getElementById(`type-select-${osc.number}`)
        const gainSlider = document.getElementById(`gain-slider-${osc.number}`)
        const releaseSlider = document.getElementById(`release-slider-${osc.number}`)
        typeSelect.value = osc.osc_type
        gainSlider.value = osc.gain
        releaseSlider.value = osc.release
        oscillators.push(osc)
    })
}

function startSound(e) {
    if (e.repeat) return

    const input = e.key
    
    if(Object.keys(keyboard).includes(input) && !keyboard[input].down) {
        oscillators.forEach(osc => {
            console.log(osc.osc_type)
            const oscNode = new OscillatorNode(audioContext, {type: osc.osc_type, frequency: keyboard[input].freq})
            const gainNode = new GainNode(audioContext, { gain: parseFloat(osc.gain)})
            const typeSelect = document.getElementById(`type-select-${osc.number}`)
            const gainSlider = document.getElementById(`gain-slider-${osc.number}`)
            const releaseSlider = document.getElementById(`release-slider-${osc.number}`)

            oscNode.connect(gainNode)
            gainNode.gain.value = (parseFloat(osc.gain) * 0.01)
            gainNode.connect(audioContext.destination)
            oscNode.start()

            gainSlider.addEventListener("input", e => gainNode.gain.value = parseFloat(e.target.value))
            gainSlider.addEventListener("change", e => oscillators[0].gain = parseFloat(e.target.value))
            typeSelect.addEventListener("change", e => oscillators[0].osc_type = e.target.value)

            nodes.push({
                osc_node: oscNode,
                gain_node: gainNode,
                key_pressed: input,
                osc_data: osc
            })
        })

        keyboard[input].down = true
    }
}

function stopSound(e) {
    const input = e.key
    if(Object.keys(keyboard).includes(input)) {
        nodes.forEach(node => {
            
            const releaseTime = node.osc_data.release
            if (node.key_pressed == input) {
                const index = nodes.indexOf(node)
                node.gain_node.gain.setValueAtTime(node.gain_node.gain.value, audioContext.currentTime)
                // node.gain_node.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.05)
                node.gain_node.gain.exponentialRampToValueAtTime(0.0000000001, audioContext.currentTime + parseFloat(releaseTime)*5)

                // setTimeout(() => {
                //     node.gain_node.disconnect()
                //     node. osc_node.disconnect()
                // }, 51)
            }
        })
        keyboard[input].down = false
    }
    // setTimeout(() => {
    //     nodes.length = 0
    // }, 2000)

}

function changeOctave(e) {
    for (const note in keyboard) {
        if (e.key == "z") {
            keyboard[note].freq = keyboard[note].freq / 2
        }
        if (e.key == "x") {
            keyboard[note].freq = keyboard[note].freq * 2
        }
    }

}

function panic(e) {
    if (e.key == "Escape") {
        for (const node in nodes) {
            node.gain_node.gain.value = 0
        }
    }
}

document.addEventListener("keydown", e => startSound(e))
document.addEventListener("keyup", e => stopSound(e))
document.addEventListener("keydown",  e => changeOctave(e))
document.addEventListener("keydown",  e => panic(e))