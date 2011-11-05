run() {
  "$@"
  echo
}

run curl -XPUT http://localhost:4567/deployment/production
run curl -XPUT http://localhost:4567/role/frontend
run curl -XPUT http://localhost:4567/host/testing -d '{ "state": "booting" }'
run curl -XPUT http://localhost:4567/host/testing/link/deployment/production
run curl -XGET http://localhost:4567/host/testing
