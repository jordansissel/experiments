from scapy.all import *
import socket
import random

packet = Ether(src="00:de:ad:be:ef:00", dst="ff:ff:ff:ff:ff:ff") \
         /IP(dst="0.0.0.1", src="0.0.0.1")\
         /UDP(dport=3074, sport=3074)\
         /"hello world"

server = Ether()/IP(src="0.0.0.1", dst="255.255.255.255")/UDP(sport=random.randint(20000,40000), dport=3333)

print repr(packet)
print repr(str(packet))

print str(packet)
sendp(packet)
#udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#udp.bind(("0.0.0.0", server[UDP].sport))
#udp.sendto(str(packet), ("127.0.0.1", 6767))

#starter = server/str(packet)

#print repr(starter)
#send(starter)
sniff(filter="udp and port %s" % server[UDP].sport, prn=lambda x: repr(x))


