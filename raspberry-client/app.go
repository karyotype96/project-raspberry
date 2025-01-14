package main

import (
	"context"
	"fmt"
	"log"
)

// App struct
type App struct {
	ctx context.Context
	c   *Connector
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	c := InitConnector()

	a.ctx = ctx
	a.c = &c
}

func (a *App) StartClient(name string, ipAddress string, portNumber int) int {
	(*a.c).Username = name
	err := (*a.c).Connect(ipAddress, portNumber)

	if err != nil {
		return -1
	}

	return 0
}

func (a *App) StopClient() {
	(*a.c).QuitChannel <- struct{}{}
}

func (a *App) GetMessage() string {
	msg := <-(*a.c).MessageChannel

	return fmt.Sprintf("%s\n%s\n", msg.sender, msg.payload)
}

func (a *App) SendMessage(msg string) string {
	fullMessage := fmt.Sprintf("%s\n%s\n%s", MESSAGE_HEADER, (*a.c).Username, msg)

	_, err := (*a.c).Conn.Write([]byte(fullMessage))
	if err != nil {
		log.Printf("Failed to write message: %v\n", err)
		return ""
	}

	return msg
}

func (a *App) GetSignal() bool {
	<-a.c.SignalChannel
	return true
}

func (a *App) SendSignal() string {
	fullMessage := fmt.Sprintf("%s\n%s\n%s", SIGNAL_HEADER, (*a.c).Username, SIGNAL_HEADER)

	_, err := (*a.c).Conn.Write([]byte(fullMessage))
	if err != nil {
		log.Printf("Failed to send signal: %v\n", err)
		return ""
	}

	return "sent"
}
