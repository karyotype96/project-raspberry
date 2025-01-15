package main

import (
	"fmt"
	"log"
	"net"
	"strings"
	"time"
)

const (
	MESSAGE_HEADER = "###MESSAGE###"
	SIGNAL_HEADER  = "###SIGNAL###"
)

type Connector struct {
	Username       string
	Conn           net.Conn
	MessageChannel chan Message
	SignalChannel  chan struct{}
	QuitChannel    chan struct{}
}

type Message struct {
	sender  string
	payload string
}

func InitConnector() Connector {
	return Connector{
		MessageChannel: make(chan Message),
		SignalChannel:  make(chan struct{}),
		QuitChannel:    make(chan struct{}),
	}
}

func (c *Connector) Connect(ipAddress string, portNumber int) error {
	dialer := net.Dialer{Timeout: 3 * time.Second}
	conn, err := dialer.Dial("tcp", fmt.Sprintf("%s:%d", ipAddress, portNumber))
	c.Conn = conn
	if err == net.ErrClosed {
		log.Printf("Server closed: %v\n", err)
		return err
	} else if err != nil {
		log.Printf("Connection could not be dialed: %v", err)
		return err
	}

	go func() {
		<-c.QuitChannel
		conn.Close()
	}()

	go c.handleConnection()

	return nil
}

func (c *Connector) handleConnection() {
	buffer := make([]byte, 1024)

	for {
		_, err := c.Conn.Read(buffer)
		if err == net.ErrClosed {
			log.Printf("Connection closed: %v\n", err)
			break
		}
		if err != nil {
			log.Printf("Error reading data into buffer: %v\n", err)
			continue
		}

		received := strings.Split(string(buffer), "\n")
		log.Printf("Received message of length %d: %v\n", len(received), received)

		if len(received) < 3 {
			log.Printf("Received invalid message...")
			continue
		}

		switch received[0] {
		case MESSAGE_HEADER:
			msg := Message{
				sender:  received[1],
				payload: received[2],
			}

			c.MessageChannel <- msg
		case SIGNAL_HEADER:
			c.SignalChannel <- struct{}{}
		default:
			log.Printf("Unknown type received...")
			continue
		}
	}
}
