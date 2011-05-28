#!/usr/local/bin/ksh

USESCREEN=false
HOSTLIST=false
NOCMD=false
XFORWARD=false
NOECHOCR=false
CMD=false
BG=false
PINGFIRST=false
USER=root
NOPASSWD=false

HOSTLIST="/usr/home/psionic/bin/hostlist"

set -- `getopt bf:lnpPstT:u:X $*`
while [ $# -gt 0 ]; do
   case $1 in
      -l) NOCMD="true" ;;
      -n) NOECHOCR="true" ;;
      -s) USESCREEN="true" ;;
      -X) XFORWARD="true" ;;
      -T) TEE="true"
          shift
          TEEFILE=$1 ;;
      -t) TTY="true" ;;
      -b) BG="true" ;;
      -f) HOSTLIST=$2
          shift ;;
      -p) PINGFIRST=true ;;
      -u) USER=$2
          shift ;;
      -P) NOPASSWD=true ;;
      --)
         shift
	 CMD="$*"
	 set ''
	 ;;
   esac

   shift
done

SSHARGS="-o 'StrictHostKeyChecking no'"

$XFORWARD && SSHARGS="${SSHARGS} -X"
$TTY && SSHARGS="${SSHARGS} -t"
$NOPASSWD && SSHARGS="${SSHARGS} -o 'PasswordAuthentication no'"

SSHARGS="${SSHARGS} ${USER}@"
ECHO="echo"
$NOECHOCR && ECHO="${ECHO} -n"

# Screen shenanigans:
# Start an ssh session in a new screen window each time?

if $PINGFIRST; then
   PINGFIRST='ping -t 1 -c 1 %1 > /dev/null 2>&1; A=$?; [ $A -ne 0 ] && echo "host is down/nonexistant" || '
fi

if $USESCREEN; then
   $BG && BG='&' || BG='';
   xapply "echo %1; screen -X screen -t %1 ssh ${SSHARGS}%1 '$CMD'" `cat $HOSTLIST`
else
   $BG && BG='&' || BG='';
   xapply "${ECHO} '%1 - '; ${PINGFIRST} ssh ${SSHARGS}%1 \"$CMD\" $BG" `cat $HOSTLIST`
fi
