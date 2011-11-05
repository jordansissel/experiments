run() {
  echo "=> $@"
  "$@"
  echo
}

# Create a deployment named 'production'
run curl -XPUT http://localhost:4567/deployment/production

# Create a role named 'frontend'
run curl -XPUT http://localhost:4567/role/frontend

# Create a host named "testing" that's "booting"
run curl -XPUT http://localhost:4567/host/testing -d '{ "state": "booting" }'

# Put the 'testing' host in 'production' deployment
run curl -XPUT http://localhost:4567/host/testing/link/deployment/production

# Add the 'frontend' role to 'testing' host
run curl -XPUT http://localhost:4567/host/testing/link/role/frontend

# Now show the 'testing' host.
run curl -XGET http://localhost:4567/host/testing
