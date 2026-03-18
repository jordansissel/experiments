#!/bin/sh
#
# ...


cloud_init() {
  ruby "${DISTROS_FILE}" "$1"
}

prepare() {
  if [ ! -f "$ORIGINAL" ]; then
    echo "Downloading $URL"
    wget -O "$ORIGINAL" "$URL"
  fi

  BASE="$WORKDIR/$1.qcow2"

  if [ ! -f "$BASE" -o "$0" -nt "$BASE" -o "$DISTROS_FILE" -nt "$BASE" ] ; then
    echo "Creating new base image"

    qemu-img create -f qcow2 -F qcow2 -b "$ORIGINAL" "$BASE" 20G

    cidir="$WORKDIR/$1-ci"
    if [ ! -d "$cidir" ] ; then
      mkdir "$cidir"
    fi
    touch $cidir/meta-data
    cloud_init "$1" > $cidir/user-data
    genisoimage  -output "$WORKDIR/$1-cloud-init.img" -volid cidata -joliet -rock -graft-points user-data="$cidir/user-data" meta-data="$cidir/meta-data"

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

  if [ -z "$WAYLAND_DISPLAY" ] ; then
    display="vnc:127.0.0.1:0"
  else
    display="sdl,gl=on,window-close=on"
  fi

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
    -display "$display" \
    -chardev stdio,mux=on,id=char0 -serial chardev:char0 -mon chardev=char0,mode=readline \
    -nic user,model=virtio,hostfwd=tcp::2222-:22 
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

DISTROS_FILE="$(dirname $0)/distros.rb"
#CONFIG="$(jq --arg target "$1" '.[$target]'  < "$DISTROS_FILE")"
#CONFIG="$(jq --arg target "fedora-43-gnome" '.[$target] as $obj | if .[$target] | has("__parent__") then $obj * .[$obj.__parent__] else $obj end' "$DISTROS_FILE")"

#URL="$(echo "$CONFIG" | jq -r '.url')"
URL="$(ruby "${DISTROS_FILE}" --url "$1")"

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
    exit 1
    ;;
esac
