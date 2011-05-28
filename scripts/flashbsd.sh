#!/bin/sh

which rsync || exit 1

DEST=/usr/flashbsd.img
DEV=/dev/md8

#umount /mnt
#mdconfig -d -u 8
#[ -f $DEST ] && rm $DEST

if [ ! -f $DEST ] ; then
  dd if=/dev/zero of=$DEST seek=400m bs=1 count=1
  mdconfig -a -t vnode -f $DEST -u 8
  dd if=/dev/zero of=$DEV bs=1k count=100
  fdisk -BI $DEV
  disklabel -w -B ${DEV}s1 auto
  disklabel ${DEV}s1 >/tmp/label.$$
  disklabel ${DEV}s1 \
  | egrep unused \
  | sed "s/c:/a:/" \
  | sed "s/unused/4.2BSD/" >>/tmp/label.$$
  disklabel -R -B ${DEV}s1 /tmp/label.$$
  rm -f /tmp/label.$$
  boot0cfg -v $DEV
  #boot0cfg -v -B -b /boot/boot0sio $DEV
  newfs ${DEV}s1a
else
  mdconfig -a -t vnode -f $DEST -u 8
fi
mount ${DEV}s1a /mnt

rsync -avz -H --exclude /rescue --exclude $DEST \
              --exclude /dev --exclude /tmp \
              --exclude /usr/local --exclude /usr/src \
              --exclude /usr/obj --exclude man/man* \
              --exclude /boot/kernel.old \
              --exclude /boot/kernel.generic \
              --exclude /usr/share/examples \
              --exclude /mnt \
              / /mnt

echo "-b" >> /mnt/boot.config
echo "console=comconsole" >> /mnt/boot/loader.conf
echo "comconsole_speed=9600" >> /mnt/boot/loader.conf
echo "/dev/ad0s1a   /   ufs   rw  1 1" > /mnt/etc/fstab
