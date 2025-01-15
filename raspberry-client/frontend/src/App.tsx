import {useEffect, useState} from 'react';
import './App.css';
import logo from "./assets/images/logo.png"
import raspberry from "./assets/sounds/raspberry.mp3"
import {StartClient, StopClient, SendMessage, GetMessage, SendSignal, GetSignal} from "../wailsjs/go/main/App";
import { Message } from './models/message_data';
import { MessageBox } from './components/message_box';

function App() {
    const [statusMessage, setStatusMessage] = useState('OFFLINE')
    const [username, setUsername] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState(20000);
    const [clientStarted, setClientStarted] = useState(false)
    const [signalShown, setSignalShown] = useState(false)
    const [messages, setMessages] = useState(Array<Message>)
    const [messageToSend, setMessageToSend] = useState('')
    const rasp = new Audio(raspberry);

    const updateUsername = (e: any) => setUsername(e.target.value)
    const updateHost = (e: any) => setHost(e.target.value)
    const updatePort = (e: any) => setPort(parseInt(e.target.value))
    const updateMessageToSend = (e: any) => setMessageToSend(e.target.value)
    const activateClient = async () => {
        if (username.trim() == "" || host.trim() == ""){
            return
        }

        let statusCode = await StartClient(username, host, port);
        if (statusCode == 0){
            setClientStarted(true)
        }
    }
    const toggleSignalShown = () => {
        setSignalShown(!signalShown);
    }
    const sendMessage = async () => {
        if (messageToSend == ''){
            return
        }

        await SendMessage(messageToSend);
        setMessageToSend('');
    }
    const sendSignal = async () => {
        await SendSignal();
    }

    useEffect(() => {
        GetMessage().then((message) => {
            messages.push(new Message(message));
            setStatusMessage(message);
        })
    })

    useEffect(() => {
        GetSignal().then(() => {
            rasp.play();
        })
    })

    return (
        <div id="App">
            { !clientStarted && <div>
                <table className='centeredTable'>
                    <tbody>
                        <tr>
                            <td colSpan={2} style={{verticalAlign: "middle"}}>
                                <img className="logo" src={logo} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign: "right", width: '50%'}}>
                                Set username: 
                            </td>
                            <td style={{textAlign: "left", width: '50%'}}>
                                <input type="text" value={username} onChange={updateUsername} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign: "right", width: '50%'}}>
                                Server host: 
                            </td>
                            <td style={{textAlign: "left", width: '50%'}}>
                                <input type="text" value={host} onChange={updateHost} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign: "right", width: '50%'}}>
                                Server port: 
                            </td>
                            <td style={{textAlign: "left", width: '50%'}}>
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
            { clientStarted && <div>
                <table className='centeredTable'>
                    <tbody>
                        <tr>
                            <td style={{textAlign: 'left', verticalAlign: "middle"}} colSpan={2}>
                                <img 
                                    className="logo" 
                                    src={logo} 
                                    onClick={toggleSignalShown}
                                />
                                { signalShown && <button 
                                    className="signalButton"
                                    onClick={sendSignal}
                                    >Send a raspberry!</button> }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <MessageBox messages={messages}/>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <textarea 
                                    className='sendBox'
                                    placeholder="Enter a message..."
                                    value={messageToSend}
                                    onKeyDown={(e: any) => {
                                        if (e.keyCode == 13){
                                            sendMessage()
                                        }
                                    }}
                                    onChange={updateMessageToSend}
                                />
                                <button 
                                    disabled={messageToSend.length < 1}
                                    className='sendButton'
                                    onClick={sendMessage}
                                >Send Message</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div> }
        </div>
    )
}

export default App
