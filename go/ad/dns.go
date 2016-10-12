package main

import (
	"github.com/miekg/dns"
  "fmt"
	"net"
)

func lookupInternal(hostname string) (srv []*net.SRV, err error) {
	_, srv, err = net.LookupSRV("", "", hostname)
	return
}

func lookupExternal(hostname, nameserver string) (srv []*net.SRV, err error) {
	client := new(dns.Client)
	msg := new(dns.Msg)
	msg.SetQuestion(hostname, dns.TypeSRV)
	response, _, err := client.Exchange(msg, fmt.Sprintf("%s:53", nameserver))

	srv = make([]*net.SRV, len(response.Answer))
	for i, a := range response.Answer {
		srv[i] = &net.SRV{
			Target: a.(*dns.SRV).Target,
			Port: a.(*dns.SRV).Port,
		}
	}
	return
}

