run() {
  (
    echo
    echo "% $@"
    "$@"
    exit=$?
    echo
    echo
  ) | sed -e 's/^/    /'
}

echo "Create a deployment named 'production'"
run curl -s -XPUT http://localhost:4567/deployment/production

echo "Create a role named 'frontend'"
run curl -s -XPUT http://localhost:4567/role/frontend

echo "Create a role named 'monitor'"
run curl -s -XPUT http://localhost:4567/role/monitor

echo "Create a host named 'testing' that has state 'booting'"
run curl -s -XPUT http://localhost:4567/host/testing -d '{ "state": "booting" }'

echo "Put the 'testing' host in 'production' deployment"
run curl -s -XPUT http://localhost:4567/host/testing/link/deployment/production

echo "Add the 'frontend' role to 'testing' host"
run curl -s -XPUT http://localhost:4567/host/testing/link/role/frontend

echo "Add the 'monitor' role to 'testing' host"
run curl -s -XPUT http://localhost:4567/host/testing/link/role/monitor

echo "Now show the 'testing' host. This will show the host and the paths to any links"
run curl -s -XGET http://localhost:4567/host/testing

echo "Now show the 'testing' host with all links fully resolved to their objects."
run curl -s -XGET http://localhost:4567/host/testing?resolve_all

echo "Show all links for this entry:"
run curl -s -XGET http://localhost:4567/host/testing/link

echo "Show all only role links for this entry:"
run curl -s -XGET http://localhost:4567/host/testing/link/role
