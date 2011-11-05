# Ohm -> REST API mapping

This is an experiment to try and make Noah a bit more general purpose.

I want to be able to specify my own model/schema in Noah because the current
host/etc stuff doesn't align with what I need to do. The way around this in
Noah today is to use ephemerals for pretty much everything outside of the
default schema. This presents a problem, however: the standard Noah models
support input validation, ephemerals are just arbitrary data. I want validation.

It should be possible to specify your own set of models that noah can use and
provide a REST interface for.

Links and watchers *must* continue working.

# Ohm -> REST mapping example

    % sh test.sh
    => curl -XPUT http://localhost:4567/deployment/production
    null
    => curl -XPUT http://localhost:4567/role/frontend
    null
    => curl -XPUT http://localhost:4567/host/testing -d { "state": "booting" }
    []
    => curl -XPUT http://localhost:4567/host/testing/link/deployment/production

    => curl -XPUT http://localhost:4567/host/testing/link/role/frontend

    => curl -XGET http://localhost:4567/host/testing
    {"id":"testing","state":"booting","links":["/deployment/production","/role/frontend"]}

    # This query is the same as the previous except that 'resolve_all' is requested which
    # yields a links as a hash of model => object_id => object for all links.
    => curl -XGET http://localhost:4567/host/testing?resolve_all
    {
        "id": "testing",
        "state": "booting",
        "links": {
            "deployment": {
                "production": {
                    "id": "production"
                }
            },
            "role": {
                "frontend": {
                    "id": "frontend"
                }
            }
        }
    }
