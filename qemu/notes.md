

# debootstrap?

First, build the root filesystem

mkdir rootfs
debootstrap --arch=amd64 noble ./rootfs http://archive.ubuntu.com/ubuntu/

Then build the image?

use systemd-repart to build disk image that:
* has a ESP and root partition
* copies files from a directory into the root

btw: kpartx to map file to /dev/mapper/loopNpM

Then combine the kernel+etc into a UEFI UKI with ukify (systemd-ukify)

# Delete partition on disk image

sfdisk -l /path/to/foo.img

# Delete partition 1
sfdisk --delete /path/to/foo.img 1

# Replace delted root partition
% cat repart.d/0-root.conf
[Partition]
Type=root
Label=cloudimg-rootfs
Format=ext4
CopyFiles=/tmp/files:/

systemd-repart --dry-run=no --definitions repart.d example.img
