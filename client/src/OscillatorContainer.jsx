import { useState } from 'react'
import Oscillator from './Oscillator'

function OscillatorContainer({ loadedPatch, setLoadedPatch }) {
    const [isModified, setIsModified] = useState(false)
    const [editName, setEditName] = useState(false)
    const [newName, setNewName] = useState("")

    const oscList = loadedPatch.oscillators.map(osc => {
        return <Oscillator
            key={osc.id}
            osc={osc}
            loadedPatch={loadedPatch}
            setLoadedPatch={setLoadedPatch}
            setIsModified={setIsModified}
        />
    })

    function savePatchSettings() {
        setIsModified(false)
        // user clicks save patch button
        // the slider values from each osc have been updating the loadedPatch in state
        // when this function runs, we set the new patches and the backend updates

        fetch(`http://localhost:4000/patches/${loadedPatch.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(loadedPatch)
        })
            // .then(res => res.json())
            // .then(data => console.log(data.message))
        }
        
    function savePatchName() {
        setEditName(false)

        fetch(`http://localhost:4000/patches/${loadedPatch.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({...loadedPatch, name: newName})
        })
            // .then(res => res.json())
            // .then(data => console.log(data.message))

        setLoadedPatch({...loadedPatch, name: newName})
        setNewName("")
    }

    function cancelEditName() {
        setEditName(false)
        setNewName("")
    }


    return (
        <>
            {
                editName ?
                    <>
                        <form onSubmit={savePatchName}>
                            <input 
                                type="text" 
                                placeholder="new patch name"
                                onChange={e => setNewName(e.target.value)}
                                value={newName}
                            >
                            </input>
                            <input type="submit" value="save"></input>
                        </form>
                        <button onClick={cancelEditName}>cancel editing</button>
                    </>
                :
                    <>
                        <h1>{loadedPatch.name}</h1>
                        <button onClick={() => setEditName(true)}>edit name</button>
                    </>
            }

            {oscList.sort((a, b) => {
                return a.props.osc.number - b.props.osc.number
            })}

            <br></br>
            {
                isModified ?  
                    <button onClick={savePatchSettings}>Save changes</button> 
                : 
                    <button onClick={savePatchSettings}>Patch saved</button>
            }

        </>
    )
}

export default OscillatorContainer