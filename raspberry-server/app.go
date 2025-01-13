package main

import (
	"context"
	"fmt"
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

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) StartServer() {
	go a.server.Serve()
}

func (a *App) StopServer() {
	go a.server.Stop()
}
