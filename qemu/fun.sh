#!/bin/sh
#
# ...


cloud_init() {
      cat <<EOF
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

apt: $(echo "$CONFIG" | jq -r '.apt | @json')
packages: $(echo "$CONFIG" | jq -r '.packages | @json')
runcmd: $(echo "$CONFIG" | jq -r '.runcmd | @json')
write_files: $(echo "$CONFIG" | jq -r '.write_files | @json')

power_state:
    delay: now
    mode: poweroff
    condition: true
EOF

}
prepare() {
  if [ ! -f "$ORIGINAL" ]; then
    echo "Downloading $URL"
    wget -O "$ORIGINAL" "$URL"
  fi

  BASE="$WORKDIR/$1.qcow2"

  if [ ! -f "$BASE" -o "$0" -nt "$BASE" -o "$DISTROS_FILE" -nt "$BASE" ] ; then
    echo "Creating new base image"
    sleep 1

    qemu-img create -f qcow2 -F qcow2 -b "$ORIGINAL" "$BASE" 20G

    (
      cd $WORKDIR
      touch meta-data
      cloud_init > user-data

      genisoimage  -output "$1-cloud-init.img" -volid cidata -joliet -rock user-data meta-data
    )

    qemu-kvm \
        -machine accel=kvm,type=q35 \
        -cpu host \
        -smp "4" \
        -m "2G" \
        -nographic \
        -drive file="$BASE",if=virtio,format=qcow2 \
        -drive file="$WORKDIR/$1-cloud-init.img",if=virtio,format=raw \
        -nic user,model=virtio,hostfwd=tcp::0-:22 \
        -name "cloud-init setup"
  fi
}

run() {
  BASE="$WORKDIR/$1.qcow2"

  qemu-kvm \
    -machine accel=kvm,type=q35 \
    -name "Ready" \
    -cpu host \
    -smp "6" \
    -m "8G" \
    -drive file="$BASE",if=virtio,format=qcow2 \
    -snapshot \
    -virtfs local,path=$PWD,mount_tag=workdir,security_model=none \
    -parallel none \
    -device virtio-gpu \
    -vga none \
    -display vnc=127.0.0.1:0 \
    -chardev stdio,mux=on,id=char0 -serial chardev:char0 -mon chardev=char0,mode=readline \
    -nic user,model=virtio,hostfwd=tcp::2222-:22 

    #-display sdl,gl=on,window-close=on \
    #-vga virtio \
  }

set -e

if [ -z "$1" -o -z "$2" ] ; then
  echo "Usage: $0 <command> <target>"
  echo 
  echo "Commands:"
  echo "  prepare"
  echo "  run"
  echo
  echo "Where <target> is the name of an image to build."
  echo
  echo "Known names:"
  jq -r 'keys[]' "$DISTROS_FILE"
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

DISTROS_FILE="$(dirname $0)/distros.json"
CONFIG="$(jq --arg target "$1" '.[$target]'  < "$DISTROS_FILE")"
#CONFIG="$(jq --arg target "fedora-43-gnome" '.[$target] as $obj | if .[$target] | has("__parent__") then $obj * .[$obj.__parent__] else $obj end' "$DISTROS_FILE")"

URL="$(echo "$CONFIG" | jq -r '.url')"

ORIGINAL="$WORKDIR/$(basename "$URL")"

case "$cmd" in
  prepare) prepare $1 ;;
  run) run $1 ;;
  cloud-init) cloud_init $1 ;;
  *)
    echo "Usage: $0 command [args]"
    echo
    echo "Commands:"
    echo "  cloud-init <template>"
    echo "  prepare <template>"
    echo "  run <template>"
    echo
    echo "Known names:"
    jq -r 'keys[]' distros.json
    exit 1
    ;;
esac
