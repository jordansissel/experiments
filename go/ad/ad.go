package main

import (
	log "github.com/Sirupsen/logrus"
	"github.com/urfave/cli"
	"os"
	"fmt"
) 

// Steps to debug AD DNS
// 1) Lookup all records on at least 3 servers:
//  a) A known public DNS
//  b) Local dns configuration
//  c) NS records for the domain
//
// 2) Do all the dns lookups agree? Is there any split horizon?
// 3) Are all the addresses reachable on the given ports?

func run(c *cli.Context) (err error) {
	domain := os.Args[1]

	srv_names := []string{
		fmt.Sprintf("_ldap._tcp.pdc._msdcs.%s.", domain),
		fmt.Sprintf("_ldap._tcp.gc._msdcs.%s.", domain),
		fmt.Sprintf("_kerberos._tcp.dc._msdcs.%s.", domain),
		fmt.Sprintf("_ldap._tcp.dc._msdcs.%s.", domain),
	}

	for _, n := range srv_names {

		srv, err := lookupExternal(n, "192.168.1.1")
		clog := log.WithFields(log.Fields{"name":n, "type": "SRV", "origin": "external"})
		if err != nil {
			clog.Error(err)
		} else {
			if len(srv) > 0 {
				for i, a := range srv {
					clog.Debugf("[%d]%s => %s:%d", i, n, a.Target, a.Port)
				}
			} else {
				clog.Debugf("%s => NO ENTRY FOUND", n)
			}
		}

		srv, err = lookupInternal(n)
		clog = log.WithFields(log.Fields{"name":n, "type": "SRV", "origin": "internal"})
		if err != nil {
			clog.Error(err)
		} else {
			if len(srv) > 0 {
				for i, a := range srv {
					clog.Debugf("[%d]%s => %s:%d", i, n, a.Target, a.Port)
				}
			} else {
				clog.Debugf("%s => NO ENTRY FOUND", n)
			}
		}
	}

	return
}

func main() {
	app := cli.NewApp()
	app.Name = "adcheck"
	app.Usage = "Check AD DNS configuration to see what might be broken. It's always a dns problem, isn't it?"

	app.Flags = []cli.Flag {
		cli.StringFlag{
			Name: "external-name-server",
			Value: "4.2.2.1",
			Usage: "The nameserver to use when doing external dns lookups.",
		},
	}

	app.Action = run
	app.Run(os.Args)
}

