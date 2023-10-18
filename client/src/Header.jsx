import React, { useState } from 'react'

function Header({ user, setUser }) {
    const [loginData, setLoginData] = useState({})

    function handleChange(e) {
        const {name, value} = e.target
        setLoginData({...loginData, [name]: value})
    }

    function logIn(e) {
        e.preventDefault()

        fetch("http://localhost:5555/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: loginData.username
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            setUser(data)
        })
    }

    function logOut(e) {
        fetch("http://localhost:5555/logout", {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
       .then(res => res.json())
       .then(message => console.log(message))

       setUser(null)
    }

    return (
        <>
            <header id="header">
                <h1>welcome to ~ s y n t h i a ~</h1>
                {
                    user ?
                        <>
                            <h2 id="user-name-display">logged in as {user.name}</h2>
                            <button onClick={logOut}>log out</button>
                        </>
                        :
                        <>
                            <h2 id="user-name-display">playing as guest</h2>
                            <form onSubmit={logIn}>
                                <input type="text" name="username" placeholder="username" onChange={handleChange}></input>
                                <input type="password" name="password" placeholder="password" onChange={handleChange}></input>
                                <input type="submit" value="log in"></input>
                            </form>
                        </>
                }
            </header>
            <h2>
                <pre>
                    {`
------------------------------------------------
black keys:      [w][e]  [t][y][u]   [o][p]
white keys:    [a][s][d][f][g][h][j][k][l][;][']
octave up/down: [z][x]

press escape to stop all sound
------------------------------------------------
`}
                </pre>
            </h2>
        </>
    )
}

export default Header