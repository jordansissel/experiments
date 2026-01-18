#!/bin/sh
#
# This script downloads an ubuntu cloud image and runs it in qemu.
#
# First boot will perform cloud-init steps, then the second boot runs
# as a qemu in -snapshot mode so that any disk changes are discarded
# when the vm shuts down.

if [ -z "$XDG_STATE_HOME" ] ; then
  WORKDIR="$HOME/.local/state/qemu"
else
  WORKDIR="$XDG_STATE_HOME/qemu"
fi

if [ ! -d "$WORKDIR" ] ; then
  mkdir "$WORKDIR"
fi

set -e
URL="https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
ORIGINAL="$WORKDIR/$(basename "$URL")"

if [ ! -f "$ORIGINAL" ]; then
  wget -O "$ORIGINAL" "$URL"
fi

BASE="${ORIGINAL%.img}.qcow2"

if [ ! -f "$BASE" -o "$0" -nt "$BASE" ] ; then
  echo "Creating new base image"
  sleep 1
  qemu-img create -f qcow2 -F qcow2 -b "$ORIGINAL" "$BASE" 20G

  (
    cd $WORKDIR
    touch meta-data

    cat > user-data <<EOF
  #cloud-config
  users:
    - default
    - name: ubuntu
      groups: sudo
      shell: /bin/bash
      ssh-authorized-keys:
        $(ssh-add -L | sed -e 's/^.*$/- "\0"/')
      sudo: ALL=(ALL) NOPASSWD:ALL

  chpasswd:
    users:
    - {name: ubuntu, password: ubuntu, type: text}
    expire: false

  ssh_pwauth: true

  package_update: true
  package_upgrade: true

  packages:
    - qemu-guest-agent

  runcmd:
    - systemctl enable ssh
    - echo "Done!" | nc 1.2.3.4 2525

  power_state:
      delay: now
      mode: poweroff
      condition: true
EOF

    genisoimage  -output "cloud-init.img" -volid cidata -joliet -rock user-data meta-data
  )

  qemu-system-x86_64 \
      -machine accel=kvm,type=q35 \
      -cpu host \
      -smp "4" \
      -m "2G" \
      -nographic \
      -drive file="$BASE",if=virtio,format=qcow2 \
      -drive file="$WORKDIR/cloud-init.img",if=virtio,format=raw \
      -net nic,model=virtio \
      -net user,hostfwd=tcp::2222-:22 \
      #-chardev socket,id=qmp,path=/tmp/vm.qmp,server=on,wait=no \
      #-mon chardev=qmp,mode=control,pretty=on \
fi

qemu-system-x86_64 \
    -machine accel=kvm,type=q35 \
    -cpu host \
    -smp "6" \
    -m "8G" \
    -nographic \
    -drive file="$BASE",if=virtio,format=qcow2 \
    -snapshot \
    -virtfs local,path=$PWD,mount_tag=workdir,security_model=none \
    -net nic,model=virtio \
    -net user,hostfwd=tcp::2222-:22

    #-chardev socket,id=qmp,path=/tmp/vm.qmp,server=on,wait=no \
    #-mon chardev=qmp,mode=control,pretty=on \
