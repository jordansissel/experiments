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

    #virt-install -n "$1" \
      #--osinfo ubuntu24.04 \
      #--graphics spice,gl.enable=yes,listen=none \
      #--ram 2048 \
      #--vcpus 4 \
      #--disk "$BASE" \
      #--graphics none \
      #--cloud-init "user-data=$cidir/user-data" \
      #--network user
      #--cdrom "$WORKDIR/$1-cloud-init.img" \
  fi
}

run() {
  BASE="$WORKDIR/$1.qcow2"

  if [ -z "$WAYLAND_DISPLAY" ] ; then
    display="vnc=127.0.0.1:0"
  else
    display="sdl,gl=on,window-close=on"
  fi

  control="$WORKDIR/$1.qmp"


  with_lock "$control" qemu-kvm \
    -machine accel=kvm,type=q35 \
    -name "$1" \
    -cpu host \
    -smp "6" \
    -m "8G" \
    -drive file="$BASE",if=virtio,format=qcow2 \
    -snapshot \
    -virtfs local,path=$PWD,mount_tag=workdir,security_model=none \
    -parallel none \
    -qmp "unix:$control,server=on,wait=off" \
    -device virtio-gpu \
    -vga none \
    -display "$display" \
    -chardev stdio,mux=on,id=char0 -serial chardev:char0 -mon chardev=char0,mode=readline \
    -nic user,model=virtio,hostfwd=tcp:127.0.0.1:0-:22 

  code="$?"
  if [ "$code" -eq 91 ] ; then
    echo "VM lockfile seems to be in use. Is this vm already running?"
    exit "$code"
  fi
}

with_lock() {
  lockfile="$1"
  shift
  if ! flock -Fn -E 91 "lockfile" "$@" ; then
    code="$?"
    if [ "$code" -eq 91 ] ; then
      echo "Lock file seems busy. Is this process already running?"
      return "$code"
    fi
  fi
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
