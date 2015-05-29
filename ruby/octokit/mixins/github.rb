require "faraday"
require "octokit"

module Mixin
  module GitHub
    def github
      # This requires you have ~/.netrc setup correctly
      # I don't know if it works with 2FA
      @github ||= Octokit::Client.new(:netrc => true).tap do |client|
        if respond_to?(:debug?) && debug?
          stack = Faraday::RackBuilder.new do |builder|
            builder.response :logger
            builder.use Octokit::Response::RaiseError
            builder.adapter Faraday.default_adapter
          end
          client.middleware = stack
        end
        client.login
        client.auto_paginate = true
      end
    end
  end
end
