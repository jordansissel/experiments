prefix=/opt/enlightenment

fetch() {
  if [ ! -f "$1" ] ; then
    wget -O - "$1"
  fi
}

extract() {
  if [ -z "$1" ] ; then
    echo "usage: extract <file>>" >&2
    return 1
  fi
  tar -zxf $1
}

build() {
  if [ -z "$1" ] ; then
    echo "usage: build <dir>" >&2
    return 1
  fi
  (
    cd $1
    ./configure --prefix=$prefix
    make
  )
}

install() {
  if [ -z "$1" ] ; then
    echo "usage: install <dir>" >&2
    return 1
  fi
  (
    cd $1
    make install
  )
}

use() {
  file="$(basename $1)"
  dir="${file%%.tar.gz}"
  fetch "$1" > $file
  extract $file
  build $dir
  install $dir
}

use http://download.enlightenment.org/releases/eina-1.1.0.tar.gz
#use http://download.enlightenment.org/releases/eet-1.5.0.tar.gz
#use http://download.enlightenment.org/releases/evas-1.1.0.tar.gz
#use http://download.enlightenment.org/releases/ecore-1.1.0.tar.gz
#use http://download.enlightenment.org/releases/embryo-1.1.0.tar.gz
#use http://download.enlightenment.org/releases/edje-1.1.0.tar.gz
#use http://download.enlightenment.org/releases/efreet-1.1.0.tar.gz
#use http://download.enlightenment.org/releases/e_dbus-1.1.0.tar.gz
