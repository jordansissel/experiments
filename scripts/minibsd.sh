#!/bin/sh

BIN="cat chmod cp df echo hostname kill ln ls mkdir mv ps pwd rm rmdir sh sync test date dd stty expr"

SBIN="adjkerntz devfs dhclient dmesg ifconfig init fsck mdconfig mount mount_nfs reboot shutdown rcorder sysctl umount swapon route"

USRBIN="basename awk false killall less passwd pkill su touch true sed cmp find logger uname mktemp login ssh ssh-keygen scp netstat sockstat tr crontab"

USRSBIN="chown inetd pw pwd_mkdb syslogd sshd cron"
USRLIBEXEC="save-entropy getty"
USRLIB="libopie libypclnt"

# Careful, termcap is 3 megs... maybe we don't need it that baddly
SHARE_FILES=misc/termcap

# Use these if you want an interactive system
BIN="$BIN csh tcsh"
SBIN="$SBIN ping "
USRBIN="$USRBIN host top w"
USRSBIN="$USRSBIN traceroute"

UNNEEDED_ETC="X11 bluetooth gnats"

SCHG_FILES="usr/bin/login usr/bin/passwd usr/bin/yppasswd usr/bin/su bin/rcp var/empty sbin/init lib/libc.so.5 lib/libcrypt.so.2 libexec/ld-elf.so.1 usr/lib/libpthread.so.1"

DESTDIR=soekris
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
  LIBS=`ldd -f "%p\n" ${DESTDIR}/bin/* ${DESTDIR}/sbin/* ${DESTDIR}/usr/bin/* ${DESTDIR}/usr/sbin/* ${DESTDIR}/usr/lib/* ${DESTDIR}/usr/libexec/* | sort | uniq`

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

sudo make -C /usr/src/etc distribution DESTDIR=$DESTDIR -DNO_SENDMAIL -DNO_BIND
cleanetc
