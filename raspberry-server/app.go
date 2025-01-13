package main

import (
	"context"
)

// App struct
type App struct {
	ctx    context.Context
	server *Server
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.server = CreateServer()
}

func (a *App) StartServer(portNumber int, batchSize int) {
	a.server.Config = ServerConfig{
		PortNumber: portNumber,
		BatchSize:  batchSize,
	}
	a.server.SendStringQueue = make(chan string, batchSize)
	go a.server.Serve()
}

func (a *App) StopServer() {
	go a.server.Stop()
}
