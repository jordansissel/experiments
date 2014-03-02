FROM stackbrew/ubuntu:13.10

ADD setup.sh /tmp/setup.sh
RUN sh /tmp/setup.sh
RUN apt-get install -y erlang
RUN wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.2.3/rabbitmq-server-generic-unix-3.2.3.tar.gz
RUN mkdir /rabbitmq
RUN tar --strip-components=1 -C /rabbitmq -xf rabbitmq-server-generic-unix-3.2.3.tar.gz
WORKDIR /rabbitmq
EXPOSE 5672
CMD sbin/rabbitmq-server
