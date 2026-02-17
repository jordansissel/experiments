FROM debian:latest AS base

ARG packages="python3 nodejs python3-django"

RUN apt-get update

FROM base AS download
RUN apt-get install --download-only -y ${packages}

FROM download AS lab
COPY --chmod=755 stripdeb.sh /usr/bin/stripdeb.sh
COPY --chmod=755 meddle.sh /usr/bin/meddle.sh

# Stop docker removing apt cache archived .deb files
RUN rm /etc/apt/apt.conf.d/docker-clean

FROM lab AS test0
ARG meddle=
RUN /usr/bin/meddle.sh ${meddle}

# Use --no-download since we previously downloaded the debs above.
RUN apt-get install --no-download -y ${packages}
