package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"strings"
	"sync"
)

// default settings
const (
	CONFIG_FILENAME         = "server.conf"
	CONFIG_NAME_PORT_NUMBER = "PORT_NUMBER"
	CONFIG_NAME_BATCH_SIZE  = "BATCH_SIZE"

	DEFAULT_PORT_NUMBER = 20000
	DEFAULT_BATCH_SIZE  = 10

	MAX_PORT_NUMBER = 65535
)

type ServerConfig struct {
	PortNumber int
	BatchSize  int
}

type Server struct {
	mu                *sync.Mutex
	listener          net.Listener
	Config            ServerConfig
	SendStringQueue   chan string
	ConnectionPool    map[string]*net.Conn
	KillSignalChannel chan struct{}
	QuitChannel       chan struct{}
}

func CreateServer() *Server {
	serverConfig := ServerConfig{}
	serverConfig.PortNumber = DEFAULT_PORT_NUMBER
	serverConfig.BatchSize = DEFAULT_BATCH_SIZE

	conf, err := os.ReadFile(CONFIG_FILENAME)

	if err != nil {
		// config file does not exist, therefore create one
		file, err := os.Create(CONFIG_FILENAME)
		if err != nil {
			log.Fatal("Initialization failed, could not create config file")
		}

		fmt.Fprintf(file, "%s:%d\n%s:%d", CONFIG_NAME_PORT_NUMBER, DEFAULT_PORT_NUMBER, CONFIG_NAME_BATCH_SIZE, DEFAULT_BATCH_SIZE)
	} else {
		configLines := strings.Split(string(conf), "\n")
		for _, line := range configLines {
			colonSplitLine := strings.Split(line, ":")
			configKey, configValue := colonSplitLine[0], colonSplitLine[1]

			if configKey == CONFIG_NAME_PORT_NUMBER {
				portNumber, err := strconv.Atoi(configValue)
				if err != nil {
					log.Fatal("Initialization failed, port number is not an integer")
				}
				if portNumber > MAX_PORT_NUMBER {
					log.Fatal("Initialization failed, port number should not be higher than 65535")
				}
				serverConfig.PortNumber = portNumber
			}
			if configKey == CONFIG_NAME_BATCH_SIZE {
				batchSize, err := strconv.Atoi(configValue)
				if err != nil {
					log.Fatal("Initialization failed, batch size is not an integer")
				}

				serverConfig.BatchSize = batchSize
			}
		}
	}

	server := Server{}

	server.mu = &sync.Mutex{}
	server.Config = serverConfig
	server.SendStringQueue = make(chan string)
	server.ConnectionPool = make(map[string]*net.Conn)
	server.KillSignalChannel = make(chan struct{})
	server.QuitChannel = make(chan struct{})

	return &server
}

func (s *Server) Serve() {
	var err error

	s.listener, err = net.Listen("tcp", fmt.Sprintf(":%d", s.Config.PortNumber))
	if err != nil {
		log.Fatal("Failed to create listener on port ", s.Config.PortNumber)
	}

	go func() {
		<-s.KillSignalChannel
		log.Println("Closing connection...")
		s.flick()
		s.QuitChannel <- struct{}{}
	}()

	go func() {
		for {
			msg, ok := <-s.SendStringQueue
			if ok {
				for _, connection := range s.ConnectionPool {
					(*connection).Write([]byte(msg))
				}
			}
		}
	}()

	for {
		select {
		case <-s.QuitChannel:
			log.Println("Kill signal received, shutting down...")
			s.listener.Close()
			return
		default:
			log.Println("Waiting for connection...")
			conn, err := s.listener.Accept()
			defer conn.Close()
			if err != nil {
				log.Println("Error accepting connection...")
				continue
			}

			log.Println("Connection accepted. Sending back data...")
			go s.handleConnection(conn)
		}
	}
}

func (s *Server) handleConnection(conn net.Conn) {
	buffer := make([]byte, 1024)
	s.mu.Lock()
	s.ConnectionPool[conn.RemoteAddr().String()] = &conn
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.ConnectionPool, conn.RemoteAddr().String())
		s.mu.Unlock()
	}()

	for {
		_, err := conn.Read(buffer)
		if err != nil {
			log.Println("Data could not be read to buffer...")
			break
		}

		if buffer[0] == 0 {
			log.Printf("Stopping connection %s\n", conn.RemoteAddr().String())
			break
		} else {
			s.SendStringQueue <- string(buffer)
		}
	}
}

// Since there will still be a connection even after the listener closes,
// this will "flick" the server by dialing that connection to close it
func (s *Server) flick() {

	dialer, err := net.Dial("tcp", fmt.Sprintf(":%d", s.Config.PortNumber))
	if err != nil {
		log.Fatal("Error dialing self...")
	}

	zeroByte := []byte{0x00}

	_, err = dialer.Write(zeroByte)
	if err != nil {
		log.Fatal("Error writing to connection...")
	}
	dialer.Close()
}

func (s *Server) Stop() {
	log.Println("Call to Stop()...")
	s.KillSignalChannel <- struct{}{}
}
