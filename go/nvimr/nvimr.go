package main

import (
  "net"
  "fmt"
  "net/rpc"
  "os"
  log "github.com/Sirupsen/logrus"
  "github.com/ugorji/go/codec"
)

func init() {
  log.SetOutput(os.Stderr)
  log.SetLevel(log.WarnLevel)
}

func DialNeovim() (client *rpc.Client, err error) {
  address, err := net.ResolveUnixAddr("unix", os.Getenv("NVIM_LISTEN_ADDRESS"))
  if err != nil {
    return
  }
  log.Infof("Connecting to %s", address)
  socket, err := net.DialUnix("unix", nil, address)
  if err != nil {
    return
  }

  // Per neovim's docs, the protocol to neovim is msgpack-rpc
  rpcCodec := codec.MsgpackSpecRpc.ClientCodec(socket, new(codec.MsgpackHandle))
  client = rpc.NewClientWithCodec(rpcCodec)
  return
}

func main() {
  client, err := DialNeovim()
  if err != nil {
    log.Errorf("Error connecting to neovim: %s", err)
    return
  }

  program := os.Args[0]

  var command string
  if program == "nvim-open" {
    command = fmt.Sprintf("%s %s", "tabnew", os.Args[1])
  }  else {
    command = os.Args[1]
  }
  
  var reply interface{}
  err = client.Call("vim_command", command, reply)

  if err != nil {
    log.Errorf("Failed to command %s", err)
    return
  }
}
