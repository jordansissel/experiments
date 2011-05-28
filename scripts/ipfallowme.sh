#!/bin/ksh

# This will NOT WORK without xpg4-compatible grep (GNU grep is compatible)
# Set this to your xpg4 compatible grep
GREP=/usr/xpg4/bin/grep

# This also requires an xpg4-compatible id
ID=/usr/xpg4/bin/id
SUDO=sudo

EID=`/usr/xpg4/bin/id -u`

if [ $EID -ne 0 ]; then
	echo "Not running as root, rerunning self with sudo..."
	exec $SUDO $0
else
	echo "Running as root, good."
fi

REMOTEHOST=

if [ ! -z $SSH2_CLIENT ]; then 
	REMOTEHOST=`echo $SSH2_CLIENT | awk '{print $1}'`
elif [ ! -z $SSH_CLIENT ]; then
	REMOTEHOST=`echo $SSH_CLIENT | awk '{print $1}'`
fi

DATE=`date '+%m.%d.%Y_%H.%M.%S'`

# Create the rules
RULES=`cat << RULES

# Rules for $USER @ $DATE
pass in quick on eri0 proto tcp from ${REMOTEHOST}/32 to any port = 80
pass in quick on eri0 proto tcp from ${REMOTEHOST}/32 to any port = 443

RULES`

RULESFILE="/etc/opt/ipf/ipfrules_${USER}_${DATE}_$$"

echo "Rulesfile: $RULESFILE"
echo "Rules:"
echo "$RULES"
echo

# Clean up when killed
cleanup() {
	echo
	echo "Cleaning up..."

	echo "Removing rules from ipf"
	ipf -rf $RULESFILE

	echo "Removing your rules file"
	rm $RULESFILE

	exit
}
trap cleanup INT HUP TERM

# Now insert our specific rules into the filter set
echo "Trying to add new rules to ipf."

# Put the rules in $RULESFILE
sh -c "echo \"$RULES\" > $RULESFILE"

# Make sure we aren't overwriting any existing ipf rules.
# If we are, take them out of the $RULESFILE
TMPFILE=/tmp/ipfrules_${USER}_${$}
NOCLOBBER=`ipfstat -io | $GREP -Fxf $RULESFILE | tee $TMPFILE`

if [ `wc -l < $TMPFILE` -gt 0 ]; then 
	echo
	echo "Existing same rules were found, omitting these:"
	cat $TMPFILE
	echo

	NEWRULESFILE=/tmp/ipfrules_${USER}_${$}_newrules
	$GREP -Fxvf $TMPFILE $RULESFILE > $NEWRULESFILE
	cp $NEWRULESFILE $RULESFILE
	rm $NEWRULESFILE
fi

rm $TMPFILE

# Quit if all of our rules already exist
if [ `sed -ne '/^[^#]/p' $RULESFILE | wc -l` -eq 0 ]; then
	echo "All generated rules already exist, exiting..."
	rm $RULESFILE
	exit
fi

# Load them into ipf
ipf -f $RULESFILE

echo
echo "Added new rules for $REMOTEHOST"
echo 
echo "Press ^C or otherwise kill this process to clean up."
echo "Alternatively, to clean up manually, run:"
echo "ipf -rf $RULESFILE"

while true; do 
	sleep 5
	ptree $$ | grep "^${$}" > /dev/null 2>&1
	[ $? -eq 0 ] && cleanup
done
