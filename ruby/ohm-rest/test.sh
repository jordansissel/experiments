run() {
  echo "=> $@"
  "$@"
  exit=$?
  echo
}

# Create a deployment named 'production'
run curl -XPUT http://localhost:4567/deployment/production

# Create a role named 'frontend'
run curl -XPUT http://localhost:4567/role/frontend

# Create a role named 'monitor'
run curl -XPUT http://localhost:4567/role/monitor

# Create a host named "testing" that's "booting"
run curl -XPUT http://localhost:4567/host/testing -d '{ "state": "booting" }'

# Put the 'testing' host in 'production' deployment
run curl -XPUT http://localhost:4567/host/testing/link/deployment/production

# Add the 'frontend' role to 'testing' host
run curl -XPUT http://localhost:4567/host/testing/link/role/frontend

# Add the 'monitor' role to 'testing' host
run curl -XPUT http://localhost:4567/host/testing/link/role/monitor

# Now show the 'testing' host. This will show the host and the paths to any
# links.
run curl -XGET http://localhost:4567/host/testing

# Now show the 'testing' host with all links fully resolved to their objects.
run curl -XGET http://localhost:4567/host/testing?resolve_all

# Show all links for this entry:
run curl -XGET http://localhost:4567/host/testing/link

# Show all only role links for this entry:
run curl -XGET http://localhost:4567/host/testing/link/role
