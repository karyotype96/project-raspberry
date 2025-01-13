import {useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {StartServer, StopServer} from "../wailsjs/go/main/App";

function App() {
    const [serverRunning, setServerRunning] = useState(false)
    const [portNumber, setPortNumber] = useState(20000)
    const [batchSize, setBatchSize] = useState(10)
    
    async function toggleServerState() {
        if (serverRunning) {
            await StopServer()
            setServerRunning(false)
        } else {
            await StartServer(portNumber, batchSize)
            setServerRunning(true)
        }
    }

    return (
        <div id="App">
            <div id="input" className="input-box">
                <table className='configTable'>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <h2 style={{color: serverRunning ? "white" : "gray"}}>SERVER STATUS: {serverRunning ? "ONLINE" : "OFFLINE"}</h2>
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign: "right"}}>
                                Port Number:
                            </td>
                            <td style={{textAlign: "left"}}>
                                <input 
                                    type="number" 
                                    className="numberBox"
                                    id="portNumber" 
                                    value={portNumber} 
                                    disabled={serverRunning}
                                    onChange={(e) => {setPortNumber(parseInt(e.currentTarget.value))}}
                                ></input>
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign: "right"}}>
                                Batch Size:
                            </td>
                            <td style={{textAlign: "left"}}>
                                <input
                                    type="number"
                                    className="numberBox"
                                    id="batchSize"
                                    value={batchSize}
                                    disabled={serverRunning}
                                    onChange={(e) => {setBatchSize(parseInt(e.currentTarget.value))}}
                                ></input>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <button id="toggleServer" className="tableButton" onClick={toggleServerState}>{serverRunning ? "Stop Server" : "Start Server"}</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default App
