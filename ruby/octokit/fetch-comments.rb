require 'octokit'
require "clamp"
require "time"
require "json"
require "opensearch"
require "stud/try"

class Time
  def to_json(*args)
    iso8601(3).to_json
  end
end

START_TIME = Time.now

def sawyer_hash(s)
  hash = {}
  s.to_hash.collect do |key, value|
    next if key =~ /_url$/
    next if key =~ /href$/
    next if value.nil?
    next if value.respond_to?(:empty?) && value.empty?
    if value.is_a?(Sawyer::Resource)
      hash[key] = sawyer_hash(value.to_hash)
    elsif value.is_a?(Time)
      hash["#{key}_age"] = START_TIME - value
      hash[key] = value
    else
      hash[key] = value
    end
  end
  hash
end

class ProjectInfoCLI < Clamp::Command
  option "--github-token", "GITHUB_TOKEN", "Your github auth token", :required => true
  option "--opensearch-host", "OPENSEARCH_HOST", "The opensearch host. This can be a full url like `https://user:pass@host:port/` if you need to use SSL and authentication", :required => true
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
      Stud::try(5.times) do
        client.pull_requests(repo, state: "all").each do |pr|
          puts "Pull Request #{pr.number}"
          process_pr(repo, pr)
        end
      end
      Stud::try(5.times) do
        client.issues(repo, state: "all").each do |issue|
          puts "Pull Request #{issue.number}"
          process_issue(repo, issue)
        end
      end
    end
  end

  def process_pr(repo, pr)
    index("pr", sawyer_hash(pr).tap { |h| h["repository"] = repo })

    client.pull_request_comments(repo, pr.number).each do |comment|
      puts comment.url
      index("comments", sawyer_hash(comment).tap { |h| h["repository"] = repo })
    end
  rescue => e
    p :Error => e
    sleep 1
    retry
  end

  def process_issue(repo, issue)
    index("issue", sawyer_hash(issue).tap { |h| h["repository"] = repo })

    client.issue_comments(repo, issue.number).each do |comment|
      puts comment.url
      index("comments", sawyer_hash(comment).tap { |h| h["repository"] = repo })
    end
  end

  def index(name, object)
    os.index(index: "github-#{name}", id: object[:url], body: object)
  end

  def os
    return @os if @os 
    @os = OpenSearch::Client.new(host: opensearch_host, transport_options: { ssl: { verify: false } })
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
ProjectInfoCLI.run
