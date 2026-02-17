#!/bin/sh
#
# ...

prepare() {
  if [ ! -f "$ORIGINAL" ]; then
    echo "Downloading $URL"
    wget -O "$ORIGINAL" "$URL"
  fi

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
  - name: dev
    groups: sudo
    shell: /bin/bash
    ssh-authorized-keys:
      $(ssh-add -L | sed -e 's/^.*$/- "\0"/')
    sudo: ALL=(ALL) NOPASSWD:ALL

chpasswd:
  users:
  - {name: dev, password: dev, type: text}
  expire: false

ssh_pwauth: true

package_update: true
package_upgrade: true

packages: $(echo "$CONFIG" | jq -r '.packages | @json')
runcmd: $(echo "$CONFIG" | jq -r '.runcmd | @json')

power_state:
    delay: now
    mode: poweroff
    condition: true
EOF

      genisoimage  -output "cloud-init.img" -volid cidata -joliet -rock user-data meta-data
    )

    qemu-kvm \
        -machine accel=kvm,type=q35 \
        -cpu host \
        -smp "4" \
        -m "2G" \
        -nographic \
        -drive file="$BASE",if=virtio,format=qcow2 \
        -drive file="$WORKDIR/cloud-init.img",if=virtio,format=raw \
        -net nic,model=virtio \
        -net user,hostfwd=tcp::2222-:22 \
        -name "cloud-init setup"
  fi
}

run() {
  qemu-kvm \
    -machine accel=kvm,type=q35 \
    -name "Ready" \
    -cpu host \
    -smp "6" \
    -m "8G" \
    -drive file="$BASE",if=virtio,format=qcow2 \
    -snapshot \
    -virtfs local,path=$PWD,mount_tag=workdir,security_model=none \
    -net nic,model=virtio \
    -net user,hostfwd=tcp::2222-:22
  }

set -e

if [ -z "$1" ] ; then
  echo "Usage: $0 prepare <target>"
  echo 
  echo "Where <target> is the name of an image to build."
  echo
  echo "Known names:"
  jq -r 'keys[]' distros.json
  exit 1
fi

if [ -z "$XDG_STATE_HOME" ] ; then
  WORKDIR="$HOME/.local/state/qemu"
else
  WORKDIR="$XDG_STATE_HOME/qemu"
fi

if [ ! -d "$WORKDIR" ] ; then
  mkdir "$WORKDIR"
fi

cmd=$1
shift

CONFIG="$(jq --arg target "$1" '.[$target]'  < distros.json)"

URL="$(echo "$CONFIG" | jq -r '.url')"

ORIGINAL="$WORKDIR/$(basename "$URL")"

BASE="${ORIGINAL%.img}.qcow2"

case "$cmd" in
  prepare) prepare $1 ;;
  run) run $1 ;;
  *)
    echo "Usage: $0 command [args]"
    echo
    echo "Commands:"
    echo "  prepare <template>"
    echo "  run <template>"
    echo
    echo "Known names:"
    jq -r 'keys[]' distros.json
    exit 1
    ;;
esac
