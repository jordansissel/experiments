
volumes=-v /media/zigzag/nextcloud:/srv/data -v /media/zigzag/letsencrypt/etc:/etc/letsencrypt -v /media/zigzag/letsencrypt/var:/var/lib/letsencrypt
name=nextcloud
build:
	docker build -t $(name) .

run:
	docker run --rm -p 443:443 -it $(volumes) --name $(name) $(name)
	
	

