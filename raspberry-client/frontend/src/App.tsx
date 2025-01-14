import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
// import {Greet} from "../wailsjs/go/main/App";
import {StartClient, StopClient} from "../wailsjs/go/main/App";

function App() {
    const [statusMessage, setStatusMessage] = useState('OFFLINE')
    const [username, setUsername] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState(20000);
    const [clientStarted, setClientStarted] = useState(false)
    const updateUsername = (e: any) => setUsername(e.target.value)
    const updateHost = (e: any) => setHost(e.target.value)
    const updatePort = (e: any) => setPort(parseInt(e.target.value))
    const activateClient = async () => {
        if (username.trim() == "" || host.trim() == ""){
            return
        }

        let statusCode = await StartClient(username, host, port)
        if (statusCode == 0){
            setClientStarted(true)
        }
    }

    return (
        <div id="App">
            { !clientStarted && <div>
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <h2>{statusMessage}</h2>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Set username: 
                            </td>
                            <td>
                                <input type="text" value={username} onChange={updateUsername} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Server host: 
                            </td>
                            <td>
                                <input type="text" value={host} onChange={updateHost} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Server port: 
                            </td>
                            <td>
                                <input type="text" value={port} onChange={updatePort} />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <button onClick={activateClient}>Connect</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div> }
        </div>
    )
}

export default App
