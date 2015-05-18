require "faraday"
require "octokit"
require "cabin"

module GithubClient
  def client
    # This requires you have ~/.netrc setup correctly
    # I don't know if it works with 2FA
    @client ||= Octokit::Client.new(:netrc => true).tap do |client|
      if debug?
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

  def http
    @http ||= Faraday.new(:url => "https://github.com") do |faraday|
      faraday.request :url_encoded
      faraday.adapter Faraday.default_adapter
    end # http
  end # def http

end

module LoggerMixin
  def logger
    return @logger if @logger
    @logger = Cabin::Channel.get
    @logger.subscribe(STDOUT)
    @logger.level = debug? ? :debug : :info
    @logger
  end
end

