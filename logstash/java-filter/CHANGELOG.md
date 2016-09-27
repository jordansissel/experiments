## 3.1.0
 - breaking,config: Remove deprecated config `remove`. Please use generic `remove_field` instead.

## 3.0.1
 - internal: Republish all the gems under jruby.

## 3.0.0
 - internal,deps: Update the plugin to the version 2.0 of the plugin api, this change is required for Logstash 5.0 compatibility. See https://github.com/elastic/logstash/issues/5141

## 2.0.6
 - internal,test: Temp fix for patterns path in tests

## 2.0.5
 - internal,deps: Depend on logstash-core-plugin-api instead of logstash-core, removing the need to mass update plugins on major releases of logstash

## 2.0.4
 - internal,deps: New dependency requirements for logstash-core for the 5.0 release

## 2.0.3
 - internal,cleanup: Code cleanups and fix field assignments

## 2.0.0
 - internal: Plugins were updated to follow the new shutdown semantic, this mainly allows Logstash to instruct input plugins to terminate gracefully,
   instead of using Thread.raise on the plugins' threads. Ref: https://github.com/elastic/logstash/pull/3895
 - internal,deps: Dependency on logstash-core update to 2.0

## 1.0.2
 - bugfix: Fix for uppercase and lowercase fail when value is already desired case
 - internal,test: Modify tests to prove bug and verify fix.

## 1.0.1
 - bugfix: Fix for uppercase and lowercase malfunction
 - internal,test: Specific test to prove bug and fix.
