import {useEffect, useState} from 'react';
import './App.css';
import {StartClient, StopClient, SendMessage, GetMessage, SendSignal, GetSignal} from "../wailsjs/go/main/App";
import { Message } from './models/message_data';
import { MessageBox } from './components/message_box';

function App() {
    const [statusMessage, setStatusMessage] = useState('OFFLINE')
    const [username, setUsername] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState(20000);
    const [clientStarted, setClientStarted] = useState(false)
    const [messages, setMessages] = useState(Array<Message>)
    const [messageToSend, setMessageToSend] = useState('')
    const updateUsername = (e: any) => setUsername(e.target.value)
    const updateHost = (e: any) => setHost(e.target.value)
    const updatePort = (e: any) => setPort(parseInt(e.target.value))
    const updateMessageToSend = (e: any) => setMessageToSend(e.target.value)
    const activateClient = async () => {
        if (username.trim() == "" || host.trim() == ""){
            return
        }

        let statusCode = await StartClient(username, host, port)
        if (statusCode == 0){
            setClientStarted(true)
        }
    }
    const sendMessage = async () => {
        if (messageToSend == ''){
            return
        }

        await SendMessage(messageToSend)
        setMessageToSend('')
    }

    useEffect(() => {
        GetMessage().then((message) => {
            messages.push(new Message(message));
            setStatusMessage(message);
        })
    })

    useEffect(() => {
        GetSignal().then(() => {
            // add logic to play sound
        })
    })

    return (
        <div id="App">
            { !clientStarted && <div>
                <table className='centeredTable'>
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
            { clientStarted && <div>
                <table className='centeredTable'>
                    <tbody>
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
