package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"strings"
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
	ServerLog       *log.Logger
	Config          ServerConfig
	IncomingChannel chan string
	OutgoingConns   map[string]net.Conn
	ServerRunning   bool
}

func (server *Server) Initialize() {
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

	server.ServerLog = log.New(os.Stdout, "raspberry-server: ", log.LstdFlags)
	server.Config = serverConfig
	server.IncomingChannel = make(chan string, serverConfig.BatchSize)
	server.OutgoingConns = make(map[string]net.Conn)
	server.ServerRunning = false
}
