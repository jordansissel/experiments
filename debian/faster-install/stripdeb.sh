#!/bin/sh
#while read pkg; do
set -e
set -x

tmpdir="/tmp/strip-pkg-$$"
for pkg in "$@"; do
  echo "$$>>> Checking $pkg"
  rm -rf "$tmpdir"
  mkdir -p "${tmpdir}/DEBIAN"
  dpkg-deb -e "$pkg" "${tmpdir}/DEBIAN"
  if find "${tmpdir}/DEBIAN" -type f | grep -E '/(preinst|postinst|prerm|postrm|triggers)$'; then
    rm -r "${tmpdir}/DEBIAN"
    dpkg-deb -R "$pkg" "${tmpdir}"
    (
      cd "${tmpdir}/DEBIAN"
      rm -vf preinst postinst prerm postrm triggers
    )
    dpkg-deb -b "${tmpdir}" "$pkg"
    pwd
    ls -ld "$pkg"
    rm -rf "$tmpdir"
  else
    echo "$$>> Package has no maintainer scripts. Nothing to do: $pkg"
  fi
done
