FROM debian:12

RUN apt-get update

RUN apt-get install -y binutils xz-utils # for 'ar'  and xz

RUN apt-get install -y --download-only reprepro gnupg debsigs createrepo-c rpm jq
# Setup apt to bypass package scripts
COPY --chmod=755 stripdeb.sh /usr/bin/stripdeb.sh

RUN echo 'DPkg::Pre-Install-Pkgs {"xargs -rL1 bash /usr/bin/stripdeb.sh 2>&1"}' > /etc/apt/apt.conf.d/stripdeb

RUN echo 
RUN apt-get install -y reprepro gnupg debsigs createrepo-c rpm jq
