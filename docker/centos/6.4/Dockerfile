FROM centos:6.4
MAINTAINER Jordan Sissel <jls@semicomplete.com>

ADD init-lxc.conf /etc/init/lxc.conf
ADD setup.sh /tmp/setup.sh
RUN bash /tmp/setup.sh

EXPOSE 22
CMD ["/sbin/init"]
