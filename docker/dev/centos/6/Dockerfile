FROM centos:centos6

# Copied from http://blog.csanchez.org/2014/08/18/building-docker-images-with-puppet/
RUN rpm --import https://yum.puppetlabs.com/RPM-GPG-KEY-puppetlabs && \
      rpm -ivh http://yum.puppetlabs.com/puppetlabs-release-el-6.noarch.rpm

# Need to enable centosplus for the image libselinux issue
RUN yum install -y yum-utils
RUN yum-config-manager --enable centosplus
RUN yum install -y puppet tar

ADD ../../puppet /etc/puppet
RUN puppet apply /tmp/puppet/manifests/site.pp  --detailed-exitcodes
