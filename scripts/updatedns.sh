#!/bin/sh

INTERFACE=sis1
MYHOSTNAME="home.semicomplete.com"
DNSSERVER="ns1.databits.net"

# keyfile format is not dnssec format:
# format is:
# "key keyname secret"
MYKEY=`cat /root/semicomplete.key`

IP=`ifconfig $INTERFACE | awk '$1 == "inet" {print $2}' | grep -v '^192.168'`

UPDATECMDS=

# Attempt to resolve IP's to hostnames
for i in $IP; do
	HOST=`host $IP | awk '/domain name pointer/ { print $5 }'`
	if [ -z "$HOST" ]; then
		CMD="update add $MYHOSTNAME 600 IN A $IP"
	else
		CMD="update add $MYHOSTNAME 600 IN CNAME $HOST"
	fi
	UPDATECMDS=`echo "${UPDATECMDS}"; echo "$CMD"`
done

TMP=`mktemp /tmp/nsupdate.XXXXX`

echo "$MYKEY" > $TMP
echo "server $DNSSERVER" >> $TMP
cat << "NSUPDATE" >> $TMP
zone semicomplete.com
update delete home.semicomplete.com.
NSUPDATE

echo "$UPDATECMDS" >> $TMP
echo "$UPDATECMDS"

echo "show" >> $TMP
echo "send" >> $TMP

nsupdate $TMP 

rm $TMP


