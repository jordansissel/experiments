#!/bin/sh

if [ "$1" = "-u" ] ; then
  update=1
  shift
fi

name="$1"

if [ -z "$name" ] ; then
	echo "Usage; $0 [-u] jailname"
  echo "-u will update an existing jail"
	exit 1
fi

if [ -d "$name" -a -z "$update" ] ; then
	echo "Jail dir '$name' already exists."
	exit 1
fi

if echo "$name" | egrep -q '[^A-z.]' ; then
  echo "Jail name '$name' is invalid. Must be only [A-z] characters"
  exit 1
fi

DESTDIR="$name"

BIN="cat chmod cp df echo hostname kill ln ls mkdir mv ps pwd rm rmdir sh sync test date dd stty expr"

SBIN="adjkerntz devfs dhclient dmesg ifconfig init fsck mdconfig mount mount_nfs reboot shutdown rcorder sysctl umount swapon route ldconfig"

USRBIN="basename awk false killall less passwd pkill su touch true sed cmp find logger uname mktemp login ssh ssh-keygen scp netstat sockstat tr crontab mail tar gzip grep nc truss"

USRSBIN="chown inetd pw pwd_mkdb syslogd sshd cron pkg_add pkg_create pkg_info pkg_version pkg_check pkg_delete pkg_sign sendmail mtree"
USRLIBEXEC="save-entropy getty sendmail/sendmail"
USRLIB="libopie libypclnt"

# Careful, termcap is 3 megs... maybe we don't need it that baddly
SHARE_FILES=misc/termcap

# Use these if you want an interactive system
BIN="$BIN csh tcsh"
SBIN="$SBIN ping "
USRBIN="$USRBIN host top w telnet"
USRSBIN="$USRSBIN traceroute"

UNNEEDED_ETC="X11 bluetooth gnats"

SCHG_FILES="usr/bin/login usr/bin/passwd usr/bin/yppasswd usr/bin/su bin/rcp var/empty sbin/init lib/libc.so.5 lib/libcrypt.so.2 libexec/ld-elf.so.1 usr/lib/libpthread.so.1"

mkdir $DESTDIR

# explicit, full path is good. Makes 'make distribution' work properly.
DESTDIR=`realpath $DESTDIR`

if [ -z "$DESTDIR" ]; then
  echo "DESTDIR is empty, maybe realpath failed?"
  exit 1
fi

makedir() {
  [ ! -d "$DESTDIR" ] && mkdir -p $DESTDIR
}

do_mtree() {
  mtree -U -p $DESTDIR < /etc/mtree/BSD.root.dist
  mtree -U -p $DESTDIR/usr < /etc/mtree/BSD.usr.dist
  mtree -U -p $DESTDIR/var < /etc/mtree/BSD.var.dist
  mtree -U -p $DESTDIR < /etc/mtree/BSD.sendmail.dist
}

run() {
  echo "$@"
  "$@"
}

copyfiles() {
  BASE=$1
  for i in $2; do
    run cp -f ${BASE}/$i ${DESTDIR}/${BASE}/$i
  done
}

copylibs() {
  LIBS=`ldd -f "%p\n" ${DESTDIR}/bin/* ${DESTDIR}/sbin/* ${DESTDIR}/usr/bin/* ${DESTDIR}/usr/sbin/* ${DESTDIR}/usr/lib/* ${DESTDIR}/usr/libexec/* ${DESTDIR}/usr/libexec/*/* | sort | uniq`

  for i in $LIBS; do
    run cp -f $i ${DESTDIR}/$i
  done
}

copylibexec() {
  run cp -f /libexec/* ${DESTDIR}/libexec/
}

cleanetc() {
  for i in $UNNEEDED_ETC; do
    echo rm -r ${DESTDIR}/etc/$i
  done
}

makedir
do_mtree
copyfiles /bin "$BIN"
copyfiles /sbin "$SBIN"
copyfiles /usr/bin "$USRBIN"
copyfiles /usr/sbin "$USRSBIN"
copyfiles /usr/libexec "$USRLIBEXEC"
copyfiles /usr/share "$SHARE_FILES"

cp -v /usr/lib/pam_* ${DESTDIR}/usr/lib

copylibs
copylibexec

sudo make -C /usr/src/etc/sendmail freebsd.cf freebsd.submit.cf
sudo make -C /usr/src/etc distribution DESTDIR=$DESTDIR -DNO_BIND
#-DNO_SENDMAIL 
cleanetc

echo "nameserver 10.0.0.1" > $DESTDIR/etc/resolv.conf
