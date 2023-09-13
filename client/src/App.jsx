// function todo() {
// NOW DOING:
// refactor to React bc state is getting complicated
// add new patch
// user login

// TODO:
// fix attack time behavior
// waveform manipulation (asdr) for individual oscillators
// gain sliders not working right; i think there's an extra node hanging out somewhere
// fix: behavior differs between click+slide vs. click on gain sliders
// update gitignore
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
// REFACTOR: 
// fix ungainly (pun very much intended) `node.gain_node.gain` situation
// abstract out updateGain/updateRelease/updateAttack etc functions

// IDEAS:
// target ed space? younger audience?
// display held down keys in visual representation (qwerty? piano? both?)
// calculate chord from held notes and display it
// incorporate sequencer, etc
// maybe similar target audience to hookpad
// trackpad as xy manipulator for pitch, other params
// }

import { useEffect, useState } from 'react'
import PatchBank from './PatchBank'
import OscillatorContainer from './OscillatorContainer'
import './App.css'

function App() {
  const [oscillators, setOscillators] = useState([])
  const [nodes, setNodes] = useState([])
  const [patchList, setPatchList] = useState([])
  const [loadedPatch, setLoadedPatch] = useState()
  const audioContext = new AudioContext()
  const keyboard = {
    "a": { freq: 262, down: false },
    "w": { freq: 277, down: false },
    "s": { freq: 294, down: false },
    "e": { freq: 311, down: false },
    "d": { freq: 330, down: false },
    "f": { freq: 349, down: false },
    "t": { freq: 370, down: false },
    "g": { freq: 392, down: false },
    "y": { freq: 415, down: false },
    "h": { freq: 440, down: false },
    "u": { freq: 466, down: false },
    "j": { freq: 494, down: false },
    "k": { freq: 523, down: false },
    "o": { freq: 554, down: false },
    "l": { freq: 587, down: false },
    "p": { freq: 622, down: false },
    ";": { freq: 659, down: false },
    "'": { freq: 698, down: false },
  }

  useEffect(() => {
    fetch("http://localhost:4000/patches")
      .then(res => res.json())
      .then(data => {
        setPatchList(data)
        setLoadedPatch(data[0])
      })
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", e => {
      if (Object.keys(keyboard).includes(e.key)) startSound(e)
      if (e.key === "Escape") panic(e)
      if (e.key === "x" || e.key === "z") changeOctave(e)
    })
    document.addEventListener("keyup", e => stopSound(e))
    console.log("you may play now")
  }, [loadedPatch])

  // function loadPatch(patch) {
  //   const patchTitle = document.getElementById("patch-title")
  //   patchTitle.textContent = patch.name

  //   oscillators.length = 0

  //   patch.oscillators.forEach(osc => {
  //       const typeSelect = document.getElementById(`type-select-${osc.number}`)
  //       const gainSlider = document.getElementById(`gain-slider-${osc.number}`)
  //       const attackSlider = document.getElementById(`attack-slider-${osc.number}`)
  //       const releaseSlider = document.getElementById(`release-slider-${osc.number}`)
  //       typeSelect.value = osc.osc_type
  //       gainSlider.value = osc.gain
  //       attackSlider.value = osc.attack
  //       releaseSlider.value = osc.release

  //       gainSlider.addEventListener("input", e => updateGain(e, osc.gain, osc.id))

  //       oscillators.push(osc)

  //       console.log(osc.release + "=>" + logValue(osc.release))
  //   })

  // }

  function startSound(e) {
    if (e.repeat) return
    const input = e.key

    if (!!loadedPatch && !keyboard[input].down) {
      loadedPatch.oscillators.forEach(osc => {
        const attackTime = logValue(osc.attack)
        console.log(osc.number + " activating")
        const oscNode = new OscillatorNode(audioContext, {type: osc.osc_type, frequency: keyboard[input].freq})
        const gainNode = new GainNode(audioContext, { gain: parseFloat(osc.gain)})
        const typeSelect = document.getElementById(`type-select-${osc.number}`)
        const gainSlider = document.getElementById(`gain-slider-${osc.number}`)
        const releaseSlider = document.getElementById(`release-slider-${osc.number}`)
        const newNode = {
          osc_node: oscNode,
          gain_node: gainNode,
          key_pressed: input,
          osc_data: osc
      }

        oscNode.connect(gainNode)
        // gainNode.gain.value = (parseFloat(osc.gain) * 0.01)
        gainNode.gain.setValueAtTime(0.0000000001, audioContext.currentTime)
        // node.gain_node.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(parseFloat(osc.gain) * 0.1, audioContext.currentTime + parseFloat(attackTime * 0.1))
        gainNode.connect(audioContext.destination)
        oscNode.start()

        // gainSlider.addEventListener("input", e => updateGain(e, gainNode.gain.value, osc.id))
        // releaseSlider.addEventListener("input", e => oscillators[0].gain = parseFloat(e.target.value))
        // attackSlider.addEventListener("input", e => oscillators[0].gain = parseFloat(e.target.value))
        // typeSelect.addEventListener("input", e => oscillators[0].osc_type = e.target.value)

        console.log("adding new node")
        console.log(nodes)
        setNodes(nodes => [...nodes, newNode])
      })

      keyboard[input].down = true
    }
  }

  function stopSound(e) {
    
    const input = e.key
    if (Object.keys(keyboard).includes(input)) {
      console.log("stopping sound")

      nodes.forEach(node => {
        const releaseTime = logValue(node.osc_data.release)

        if (node.key_pressed == input) {
          node.gain_node.gain.setValueAtTime(node.gain_node.gain.value, audioContext.currentTime)
          // node.gain_node.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.05)
          node.gain_node.gain.exponentialRampToValueAtTime(0.0000000001, audioContext.currentTime + parseFloat(releaseTime))

          setTimeout(() => {
              node.gain_node.disconnect()
              node. osc_node.disconnect()
          }, 51)
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
      nodes.forEach(node => {
        console.log("stopping node")
        node.gain_node.gain.setValueAtTime(node.gain_node.gain.value, audioContext.currentTime)
        node.gain_node.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.002)

        setTimeout(() => {
          node.gain_node.disconnect()
          node.osc_node.disconnect()
        }, 51)
      })
  }

  function updateGain(e, gainToUpdate, oscId) {
    // const saveStatus = document.getElementById("save-status")
    // saveStatus.style.display = "block"
    console.log(oscId)
    console.log("updating gain")
    console.log(e)
    gainToUpdate = parseFloat(e.target.value)
    console.log(gainToUpdate)

    fetch(`http://localhost:4000/oscillators/${oscId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ gain: gainToUpdate })
    })
      .then(res => res.json())
      .then(data => console.log(data.message))
  }

  function logValue(position) {
    const minInput = 0
    const maxInput = 100

    const minValue = Math.log(1)
    const maxValue = Math.log(1000000000)

    const scale = (maxInput - minInput) / (maxValue - minValue)

    return Math.exp(minValue + scale * (position - minInput))
  }

  return (
    <div>
      <header>
        <h1>welcome to ~ s y n t h i a ~</h1>
      </header>
      <h2>
        use home row keys (the asdf row) to play
      </h2>
      <h2>
        press escape to stop all sound
      </h2>
      <PatchBank patchList={patchList} setPatchList={setPatchList} setLoadedPatch={setLoadedPatch} />
      {loadedPatch && <OscillatorContainer loadedPatch={loadedPatch} setLoadedPatch={setLoadedPatch} />}
    </div>
  )
}

export default App