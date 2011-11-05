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

Start things up with 'ruby ohmrest.rb' then run 'test.sh' - output below:

    % sh test.sh

But first, what are our models? Three models in this example. Host, Role, and Deployment.

    class Deployment < Model
      include Linkable
    end  # class Deployment

    class Host < Model
      include Linkable
      attribute :state

      def validate
        assert_present :state
      end # def validate

      def to_hash
        super.merge(:state => state, :links => links.collect { |l| l.to_hash } )
      end # def validate
    end # class Host

    class Role < Model
    end # class Role

All three of these become available as REST APIs under /modelname.

* PUT to /modelname/{id} will create it
* GET to /modelname/{id} will fetch it
* PUT to /modelname/{id}/link/{othermodel}/{otherid} will create a link to another object.
* GET to /modelname/{id}/link will show all links
* ... you get the idea ...

Here's a simple example. Lines starting with '%' are commands run. Other lines are simply output.

Create a deployment named 'production'
    
    % curl -s -XPUT http://localhost:4567/deployment/production
    {
      "id": "production"
    }
    
Create a role named 'frontend'
    
    % curl -s -XPUT http://localhost:4567/role/frontend
    {
      "id": "frontend"
    }
    
Create a role named 'monitor'
    
    % curl -s -XPUT http://localhost:4567/role/monitor
    {
      "id": "monitor"
    }
    
Create a host named 'testing' that has state 'booting'
    
    % curl -s -XPUT http://localhost:4567/host/testing -d { "state": "booting" }
    {
      "id": "testing",
      "state": "booting",
      "links": [
    
      ]
    }
    
Put the 'testing' host in 'production' deployment
    
    % curl -s -XPUT http://localhost:4567/host/testing/link/deployment/production
    {
      "id": "testing",
      "state": "booting",
      "links": [
        "/deployment/production"
      ]
    }
    
Add the 'frontend' role to 'testing' host
    
    % curl -s -XPUT http://localhost:4567/host/testing/link/role/frontend
    {
      "id": "testing",
      "state": "booting",
      "links": [
        "/deployment/production",
        "/role/frontend"
      ]
    }
    
Add the 'monitor' role to 'testing' host
    
    % curl -s -XPUT http://localhost:4567/host/testing/link/role/monitor
    {
      "id": "testing",
      "state": "booting",
      "links": [
        "/deployment/production",
        "/role/frontend",
        "/role/monitor"
      ]
    }
    
Now show the 'testing' host. This will show the host and the paths to any links
    
    % curl -s -XGET http://localhost:4567/host/testing
    {
      "id": "testing",
      "state": "booting",
      "links": [
        "/deployment/production",
        "/role/frontend",
        "/role/monitor"
      ]
    }
    
Now show the 'testing' host with all links fully resolved to their objects.
    
    % curl -s -XGET http://localhost:4567/host/testing?resolve_all
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
          },
          "monitor": {
            "id": "monitor"
          }
        }
      }
    }
    
Show all links for this entry:
    
    % curl -s -XGET http://localhost:4567/host/testing/link
    [
      {
        "id": "1",
        "model": "deployment",
        "object_id": "production"
      },
      {
        "id": "2",
        "model": "role",
        "object_id": "frontend"
      },
      {
        "id": "3",
        "model": "role",
        "object_id": "monitor"
      }
    ]
    
Show all only role links for this entry:
    
    % curl -s -XGET http://localhost:4567/host/testing/link/role
    [
      {
        "id": "2",
        "model": "role",
        "object_id": "frontend"
      },
      {
        "id": "3",
        "model": "role",
        "object_id": "monitor"
      }
    ]
    
