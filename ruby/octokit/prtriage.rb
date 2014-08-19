require "clamp"
require "faraday"
require "insist"

class PullRequestClassifier < Clamp::Command

  option "--[no-]dry", :flag, "Do a dry run", :default => true
  option "--debug", :flag, "Enable debugging", :default => false
  parameter "USER/PROJECT", "The user/project repo name on github.", :attribute_name => "repo"

  def execute
    require "octokit"
    require "diff_parser"
    require "elasticsearch"
    pulls = client.pull_requests(repo)

    pulls.each do |pr|
      process_pr(pr)
    end # pulls.each

    nil
  end # def execute

  def process_pr(pr)
    # Compute stats on the patch itself
    response = http.get(pr.diff_url)
    diff = response.body
    difflines = diff.split("\n")
    additions = difflines.grep(/^\+ /).count
    deletions = difflines.grep(/^- /).count
    sections = difflines.grep(/^@@ /).count
    files = difflines.grep(/^(\+\+\+)/).count
    weight = Math.log([additions,deletions].max * sections + 1, 10)
    age = Time.now - pr.created_at

    # Ship to Elasticsearch
    index(es, pr, {
      "age" => age,
      "diff" => diff,
      "files" => files,
      "additions" => additions,
      "deletions" => deletions,
      "sections" => sections,
      "weight" => weight
    })

    # Update the label in Github
    label = "O(#{weight.to_i})"
    puts "Setting label on ##{pr.number} to #{label}"
    client.add_labels_to_an_issue(repo, pr.number, [ label ]) unless dry?
  end # def process_pr

  def index(es, pr, extra)
    insist { extra }.is_a?(Hash)
    doc = pr.to_hash
    # Do time conversions
    doc.keys.grep(/_at$/).each do |key|
      # Some keys like 'created_at' are Time objects
      # Let's convert them to ISO8601 strings for Elasticsearch
      value = doc[key]
      next if value.nil?
      if value.is_a?(Time)
        doc[key] = value.strftime("%Y-%m-%dT%H:%M:%S%z")
      end
    end

    doc.merge!(extra)

    # Fix a few object problems
    doc["user"] = pr.user.login
    doc["base"] = "#{pr.base.label}##{pr.base.sha}"
    doc["head"] = "#{pr.head.label}##{pr.head.sha}"
    doc.delete("_links")

    # Fetch comments
    doc["comments"] = []
    comments = client.get(pr.comments_url)
    comments.each do |comment|
      cdoc = comment.to_hash
      cdoc["user"] = comment.user.login
      doc["comments"] << cdoc
    end
    es.index(:index => "logstash-pull-requests", :type => "pr", :id => pr.number.to_s, :body => doc)
    nil
  end # def index

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

  def es
    @es ||= Elasticsearch::Client.new
  end # def es
end # class PullRequestClassifier

PullRequestClassifier.run
