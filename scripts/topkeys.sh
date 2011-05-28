#!/usr/local/bin/ksh
# Topkeys.sh
# Enables use of the top row of "hot keys" on my keboard
#
# Currently supported keyboard types:
#    Microsoft Internet Pro Keyboard
#
#
# You don't *need* a special keyboard, you can just bind keys to run this shell
# script with a certain parameter...
#
# How to use, Call this shell script with a given word option:
# ./topkeys.sh <option>
#
# Options:
#     back ........... browser "back"
#     forward ........ browser "forward"
#     intarwebstop ... browser "top"
#     refresh ........ browser "refresh"
#     favorites ...... browser favorites
#     webhome ........ browser webhome
#     mail ........... mail
#     mute ........... mute 
#     volminus ....... decrease volume
#     volplus ........ increase volue
#     playpause ...... play/pause media button
#     mediastop ...... media stop button
#     prev ........... mdia previos button
#     next ........... media next button
#     media .......... media selector button
#

OSDCAT='osd_cat -f "-adobe-helvetica-bold-r-*-*-34-*-*-*-*-*-*-*" -p bottom -c green -d 3 -l 1 -o 50'

intarweb_webhome() {

}

intarweb_mail() {
	#xterm -bg black -fg white -ls -e "ssh -t fury"
}

media_mute() {
   [ ! -f /tmp/keymute_date ] && date +%s > /tmp/keymute_date
	DATE=`cat /tmp/keymute_date`

	CDATE=`date +%s`
	VOL=`mixer -s vol | awk -F ":" '{print $2}'`

	date +%s > /tmp/keymute_date

	if [ $(($CDATE - $DATE)) -ge 2 ]; then
		if [ "$VOL" -eq 0 ] || [ -f /tmp/hotkey_hushed ]; then
			VOL=`cat /tmp/hotkey_vol`
			mixer vol $VOL
			osd "Unmuted (Current volume: $VOL%)"
			[ -f /tmp/hotkey_hushed ] && rm /tmp/hotkey_hushed 
			[ -f /tmp/hotkey_vol ] && rm /tmp/hotkey_vol
			[ -f /tmp/keymute_date ] && rm /tmp/keymute_date
		else
			echo "$VOL" > /tmp/hotkey_vol
			mixer vol 0
			osd "Muted"
		fi
	else
		if [ -f /tmp/hotkey_hushed ]; then
			mixer vol 0
			osd "Muted"
			rm /tmp/hotkey_hushed
			exit
		fi 

		if [ "$VOL" -eq 0 ] || [ -f /tmp/hotkey_hushed ]; then
			VOL=`cat /tmp/hotkey_vol`
			mixer vol $VOL
			osd "Unmuted (Current volume: $VOL%)"
			[ -f /tmp/hotkey_vol ] && rm /tmp/hotkey_vol
			[ -f /tmp/keymute_date ] && rm /tmp/keymute_date
		else
			echo "$VOL" > /tmp/hotkey_vol
			touch /tmp/hotkey_hushed
			mixer vol $(($VOL / 2))
			osd "Sound hushed like my baby cousin... ("$(($VOL / 2))"%)"
		fi
	fi
}

media_volminus() {
	WASMUTED=
	if [ -f /tmp/hotkey_vol ]; then
		mixer vol `cat /tmp/hotkey_vol`
		WASMUTED=1
		rm /tmp/hotkey_vol
	fi

	VOL=$((`mixer -s vol | awk -F ":" '{print $2}'` - 4))
	[ "$VOL" -gt 0 ] && mixer vol $VOL || VOL=0
	MSG="Volume"
	[ "$WASMUTED" -eq 1 ] && MSG="$MSG (Unmuted):" || MSG="$MSG:"
	osd "$MSG $VOL%"
}

media_volplus() {
	WASMUTED=
	if [ -f /tmp/hotkey_vol ]; then
		mixer vol `cat /tmp/hotkey_vol`
		WASMUTED=1
		rm /tmp/hotkey_vol
	fi

	VOL=$((`mixer -s vol | awk -F ":" '{print $2}'` + 4))
	[ "$VOL" -lt 100 ] && mixer vol $VOL || VOL=100
	MSG="Volume"
	[ "$WASMUTED" -eq 1 ] && MSG="$MSG (Unmuted):" || MSG="$MSG:"
	osd "$MSG $VOL%"
}

media_playpause() {
	_xmms -t
}

media_stop() {
	_xmms -s
}

media_prev() {
	_xmms -r
}

media_next() {
	_xmms -f
}

media_media() {
   [ ! -f /tmp/keymedia_date ] && date +%s > /tmp/keymedia_date
	#MEDIA=`cat /tmp/keymedia`
	DATE=`cat /tmp/keymedia_date`

	CDATE=`date +%s`
	echo "$DATE / $CDATE / " $(($CDATE - $DATE))
	if [ $(($CDATE - $DATE)) -lt 2 ]; then
	   osd "Cycle media $DATE"
	else
		#osd "Current Media: $MEDIA"
		xmms_status
	fi
	date +%s > /tmp/keymedia_date
}

_xmms() {
	(ps -ax -o command | grep "^xmms") && xmms $*
}

xmms_status() {
	# Turn Xmms::info()'s output into useful shell code.
	eval `perl -MXmms -e info | perl -ne 'if (m/^(Artist|Title|File)/) { chomp; s/^(Artist|Title|File)\.+//; print "$1=\""; print; print "\"\n"; }'`

	# Print out the status of xmms
	if [ "$Artist$Title" = "??" ]; then
		osd "XMMS: " ${File##*/}
	else
		osd "XMMS: ($Artist) $Title"
	fi


}
osd() {
   [ ! -f /tmp/osdcat ] && touch /tmp/osdcat

	# Make sure osd_cat is running
	echo "$*" >> /tmp/osdcat
	ps -ax -o "command" | grep "^osd_cat" > /dev/null 2>&1
	[ $? -eq 1 ] && sh -c "tail -f /tmp/osdcat | $OSDCAT &"
}

if [ $# -eq 0 ]; then
	xmodmap -e 'keycode 234 = F13'   # Back
	xmodmap -e 'keycode 233 = F14'   # Forward
	xmodmap -e 'keycode 232 = F15'   # Intarweb Stop
	xmodmap -e 'keycode 231 = F16'   # Refresh
	xmodmap -e 'keycode 229 = F17'   # Search
	xmodmap -e 'keycode 230 = F18'   # Favorites
	xmodmap -e 'keycode 178 = F19'   # Web/Home
	xmodmap -e 'keycode 236 = F20'   # Mail
	xmodmap -e 'keycode 160 = F21'   # Mute
	xmodmap -e 'keycode 174 = F22'   # Volume -
	xmodmap -e 'keycode 176 = F23'   # Volume +
	xmodmap -e 'keycode 162 = F24'   # Play/Pause
	xmodmap -e 'keycode 164 = F25'   # Media Stop
	xmodmap -e 'keycode 144 = F26'   # Prev Track
	xmodmap -e 'keycode 153 = F27'   # Next Track
	xmodmap -e 'keycode 237 = F28'   # Media
fi

case $* in 
	back) intarweb_back ;;
	forward) intarweb_back ;;
	intarwebstop) intarweb_stop;;
	refresh) intarweb_refresh ;;
	favorites) intarweb_favorites;;
	webhome) intarweb_webhome ;;
	mail) intarweb_mail ;;
	mute) media_mute ;;
	volminus) media_volminus ;;
	volplus) media_volplus;;
	playpause) media_playpause ;;
	mediastop) media_stop ;;
	prev) media_prev ;;
	next) media_next ;;
	media) media_media ;;
esac

