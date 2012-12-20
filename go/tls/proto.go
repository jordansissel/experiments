package main

import (
  //"fmt"
  "encoding/binary"
  //"os"
  //"time"
  "io"
)

//func WriteData(:tabe
  //conn.Write([]byte("1D"))

  // Write the sequence
  //binary.Write(conn, binary.BigEndian, sequence)

func writeMap(conn io.Writer, sequence uint32, m map[string]string) {

  // How many fields in this data frame
  binary.Write(conn, binary.BigEndian, uint32(len(m)))

  for key, value := range m {
    binary.Write(conn, binary.BigEndian, uint32(len(key)))
    conn.Write([]byte(key))
    binary.Write(conn, binary.BigEndian, uint32(len(value)))
    conn.Write([]byte(value))
  }
} /* WriteMap */
