package main
import (
  "syscall"
  "os/exec"
  "fmt"
)

func main() {
  cmd := exec.Command("/bin/sh", "-c", "exit 42")
  cmd.Start()
  result := cmd.Wait()
  status := result.(*exec.ExitError).ProcessState.Sys().(syscall.WaitStatus)
  fmt.Printf("%v\n", status.ExitStatus())
}
