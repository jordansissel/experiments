require "json"
require "faraday"

module Mixin
  module ElasticCLA
    def self.included(klass)
      # Add --debug and --log flags if our mixin target is a Clamp::Command
      if Kernel.const_defined?(:Clamp) && klass.ancestors.include?(Clamp::Command)
        klass.instance_eval do
          option "--cla-uri", "CLA_URI", "The http rest url for the cla check api"
        end
      end
    end
    # This method requires @cla_uri being set before it'll work.
    def check_cla(repo, pr, cla_uri)
      logger.info("Checking CLA", :repo => repo, :pr => pr)
      uri = URI.parse(cla_uri)
      conn = Faraday.new(:url => "#{uri.scheme}://#{uri.host}")
      conn.basic_auth(uri.user, uri.password)
      response = conn.get(uri.path, :repository => repo, :number => pr)
      JSON.parse(response.body)
    end

    # Returns [ bool, string ]
    #
    # bool will be true if the CLA is signed.
    # if bool is false, the string will be a text message indicating the cause of failure.
    def cla_status(repo, pr, cla_uri)
      cla_result = check_cla(repo, pr, cla_uri)
      return [ cla_result["status"] != "error", cla_result["message"] ]
    end
  end
end
