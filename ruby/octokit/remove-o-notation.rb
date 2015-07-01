require "octokit"
require "clamp"
require "cabin"

class RemoveONotation < Clamp::Command
  def logger
    @logger = Cabin::Channel.get
  end

  option "--github-token", "GITHUB_TOKEN", "Your github auth token", :required => true
  option "--debug", :flag, "Debug logs"
  parameter "ORGANIZATION", "The github organization"
  parameter "[REPOSITORY] ...", "The repository name"

  def execute
    logger.subscribe(STDOUT)
    logger.level = debug? ? :debug : :info
    Octokit.auto_paginate = true
    #client.organization_repositories("logstash-plugins")
    if repository_list.empty?
      puts "No repository given. Using all repositories in #{organization}"
      repositories = list_repositories(organization)
    elsif repository_list.size == 1 && repository_list.first =~ /^\/.*\/$/
      puts "Using all repositories in #{organization} matching #{repository_list.first}"
      re = Regexp.new(repository_list.first[1..-2])
      repositories = list_repositories(organization).grep(re)
    else
      repositories = repository_list
    end

    repositories.each do |r|
      remove_o_labels(organization, r)
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

  def remove_o_labels(organization, repository)
    project = "#{organization}/#{repository}"
    client.pull_requests(project).each do |pr|
      o_labels = client.issue(project, pr.number).labels.map { |x| x.name }.select { |x| x =~ /^O\(\d+\)$/ }
      logger.info("Removing O(n) labels", :project => project, :pr => pr.number, :labels => o_labels)
      o_labels.each do |label|
        client.remove_label(project, pr.number, label)
      end
    end
  end
end

RemoveONotation.run
