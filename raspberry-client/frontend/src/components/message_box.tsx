import React from 'react'
import { Message } from '../models/message_data'
import * as _ from "lodash"

interface IMessageBoxProps {
    messages: Array<Message>
}

export class MessageBox extends React.Component<IMessageBoxProps, {}> {
    constructor(props: any){
        super(props)
    }

    render(): React.ReactNode {
        return <div className='chatbox'>
            { _.map(this.props.messages, (msg, index) => {
                return <div className={index % 2 == 0 ? 'msgEven' : 'msgOdd'}>
                    <div className='usernameSection'>
                        { msg.sender + ': '}
                    </div>
                    <div className='messageSection'>
                        { msg.message }
                    </div>
                </div>
            })}
        </div>
    }
}