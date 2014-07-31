FROM ubuntu:12.04
MAINTAINER Jordan Sissel <jls@semicomplete.com>
# Originally taken from https://github.com/tianon/dockerfiles

ADD init-lxc.conf /etc/init/lxc.conf
ADD setup.sh /tmp/setup.sh
RUN bash /tmp/setup.sh

EXPOSE 22
CMD ["/sbin/init"]
