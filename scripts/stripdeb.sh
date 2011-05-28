#!/bin/bash
# Usage: stripdeb.sh something.deb

echo "Args: $*"
echo "Stripping $1 of pre/post maintainer scripts"
tmpdir=$(mktemp -d)

[ ! -f $1 ] && exit 1

genldconfigscript() {
  # Maybe we should just make the always run 'ldconfig'
  cat << EOF
#!/bin/sh
[ "\$1" = "configure" ] && ldconfig
[ "\$1" = "remove" ] && ldconfig
true
EOF
}

# The .deb is an 'ar' archive, grab the control files.
ar -p $1 control.tar.gz | tar -C $tmpdir -zxf -

# Kill the stupid package scripts, but log what we do.
for i in $tmpdir/{post,pre}{rm,inst} ; do
  if [ -f $i ] ; then

    # Linux sucks, so we have to run ldconfig on any library changes.
    # So if the post/pre script includes ldconfig 
    if grep -q ldconfig $i ; then
      echo "$1: Replacing $i with a generic 'ldconfig' script"
      genldconfigscript > $i
      chmod 755 $i
    else
      echo "$1: Stripping $(basename $i)"
      rm $i
    fi
  fi
done

# Rebuild the control tarball
tar -C $tmpdir -zcf control.tar.gz .

# And replace the old one with the stripped one back into the .deb
ar -r $1 control.tar.gz

# Clean up
rm control.tar.gz


