require 'octokit'
require "clamp"
require "time"
require "json"
require "elasticsearch"
require "stud/try"

class Unsubscribe < Clamp::Command
  option "--github-token", "GITHUB_TOKEN", "Your github auth token", :required => true
  parameter "ORGANIZATION[/REPO] ...", "The project(s) for which to gather information", :attribute_name => :repository_list

  def execute
    Octokit.auto_paginate = true

    repositories = []
    repository_list.each do |r|
      if r.include?("/")
        repositories << r
      else
        repositories += list_repositories(r).map { |proj| "#{r}/#{proj}" }
      end
    end

    puts "Reviewing #{repositories.count} repositories"
    repositories.each do |repo|
      puts "Unwatching: #{repo}"
      p client.delete_subscription(repo)
    end
  end

  def client
    return @client if @client
    @client = Octokit::Client.new
    @client.access_token = github_token
    @client.login
    @client
  end

  def list_repositories(org)
    client.organization_repositories(org).collect { |r| r[:name] }
  end

end
Unsubscribe.run
