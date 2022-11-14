require 'octokit'
require "clamp"
require "time"
require "stud/try"

class ProjectInfoCLI < Clamp::Command
  option "--github-token", "GITHUB_TOKEN", "Your github auth token", :required => true, :environment_variable => "GITHUB_TOKEN"
  option "--branch", "BRANCH", "The branch to compare against.", :default => "main"

  parameter "REPOSITORY", "The repository to scan"
  #parameter "TAG", "Only show PRs closed a given PR"
  parameter "AFTER_DATE", "Only show PRs closed after a given time" do |value|
    Time.parse(value)
  end

  class SearchDone < RuntimeError; end

  def find_prs_since
    pulls = []

    client.paginate("/repos/#{repository}/pulls", state: "closed", sort: "updated", direction: "desc") do |result|
      result.each do |pr|
        raise SearchDone if pr.closed_at <= after_date
        pulls << pr if pr.merged_at.to_i > 0
      end
    end
  rescue SearchDone
    return pulls
  end

  def execute

    pulls = find_prs_since

    contributors = {}
    pulls.each do |pr|
      contributor = (contributors[pr.user.url] ||= client.get(pr.user.url))
      puts "* #{pr.html_url} (`\##{pr.number}`_; #{contributor.name})"
    end
  end

  def client
    return @client if @client

    stack = Faraday::RackBuilder.new do |builder|
      #builder.use Faraday::Retry::Middleware, exceptions: [Octokit::ServerError] # or Faraday::Request::Retry for Faraday < 2.0
      builder.use Octokit::Middleware::FollowRedirects
      builder.use Octokit::Response::RaiseError
      builder.use Octokit::Response::FeedParser
      builder.response :logger do |logger|
        logger.filter(/(Authorization: "(token|Bearer) )(\w+)/, '\1[REMOVED]')
      end
      builder.adapter Faraday.default_adapter
    end
    #Octokit.middleware = stack

    @client = Octokit::Client.new
    @client.auto_paginate = true
    @client.access_token = github_token
    @client.login
    @client
  end

end
ProjectInfoCLI.run
