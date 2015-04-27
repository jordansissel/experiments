Idea: Make multiplatform testing easier.

I would like to be able to do 'rspec' and have it run on specially provisioned
systems. Many projects need this:

* fpm - for testing rpm, deb, etc support on various platforms
* pleaserun - for testing systemd, upstart, etc on various platforms
* logstash - verifying plugins work against external services (redis, etc)

Tool options: test-kitchen, vagrant, terraform, docker

* Docker's out because I'm done dealing with their toxic community.
* vagrant may be a good option

## test-kitchen experiments

test-kitchen seems focused on testing "other" things, not the current thing, if
this makes sense. test-kitchen does a great job at resource management
(create, provision, run test, destroy, etc)

test-kitchen relies on tests being listed in a special directory structure:

`test/integration/<suite_name>/<busser_name>/...`

My use case is different. I want to run my current project's test suite on
remote systems.

Further, test-kitchen's output is very noisy and a bit hard to process with my
eyes.

## vagrant experiments


