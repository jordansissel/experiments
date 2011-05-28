#!/bin/sh
# Lid shut smart sleeper!
#
# Only puts your laptop to sleep if "necessary" when the
# lid gets closed.
#
# Necessary means:
#   1) Being run on battery power
#   2) /dev/accel shows that we (the laptop) are somewhat vertical
#
# Put the following in /etc/devd.conf
#
# notify 10 {
#      match "system" "ACPI";
#      match "subsystem" "Lid";
#      action "/path/to/lidshut $notify &";
# };
#

STATE=$1
LOGGER='logger -t lidshut'

TACKFILE=/var/run/lidshut.tack

naptime() {
	WHY=$1
	$LOGGER "Sleeping due to lid closure: $WHY"
	acpiconf -s 3
	$LOGGER "I'm awake! Cleaning up..."
	rm $TACKFILE
	exit
}

# Lid is shut?
# $STATE == 0x00 when lid is shut
#        == 0x01 when lid is open
if [ "$STATE" = "0x00" ]; then
	ln -fs PID:$$ $TACKFILE
	while :; do
		#$LOGGER Checking AC-line status
		[ `sysctl hw.acpi.acline` eq "1" ] && naptime "Running on battery"

		#$LOGGER Checking tilts
		if [ -L "$TACKFILE" ]; then
			VALUE=`sysctl hw.accel.data | awk '($3 < 500 || $3 > 600) || ($4 < 500 || $4 > 600)'`
			[ ! -z "$VALUE" ] && naptime "Laptop is on the move!"
		else
			$LOGGER "Lid opened, did not sleep"
			exit;
		fi
		sleep 1
	done
else
	#$LOGGER "Cleaning up"
	rm $TACKFILE > /dev/null 2>&1
fi
