import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {StartServer, StopServer} from "../wailsjs/go/main/App";

function App() {
    const [serverRunning, setServerRunning] = useState(false)
    
    async function toggleServerState() {
        if (serverRunning) {
            await StopServer()
            setServerRunning(false)
        } else {
            await StartServer()
            setServerRunning(true)
        }
    }

    return (
        <div id="App">
            <div id="input" className="input-box">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <button id="toggleServer" className="toggleServer" onClick={toggleServerState}>{serverRunning ? "Stop Server" : "Start Server"}</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default App
