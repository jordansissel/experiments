require "clamp"
require "json"
require "faraday"
require "insist"
require "cabin"

class PullRequestClassifier < Clamp::Command

  option "--[no-]index", :flag, "Index into local Elasticsearch", :default => false
  option "--[no-]label", :flag, "Label issues on GitHub", :default => false
  option "--[no-]cla", :flag, "Do a CLA check and set commit status accordingly", :default => false
  option "--cla-uri", "CLA_URI", "The http rest url for the cla check api"
  option "--debug", :flag, "Enable debugging", :default => false
  parameter "USER/PROJECT ...", "The user/project repo name on github.", :attribute_name => "repos"

  def logger
    @logger = Cabin::Channel.get
  end

  def execute
    logger.subscribe(STDOUT)
    logger.level = debug? ? :debug : :info
    
    require "octokit"
    require "diff_parser"
    require "elasticsearch"

    repos.each do |repo|
      client.pull_requests(repo).each do |pr|
        process_pr(repo, pr)
      end # pulls.each
    end

    nil
  end # def execute

  def process_pr(repo, pr)
    # Compute stats on the patch itself
    logger.info("Processing PR", :repo => repo, :pr => pr.number)

    response = http.get(pr.diff_url)
    diff = response.body
    difflines = diff.split("\n")
    additions = difflines.grep(/^\+ /).count
    deletions = difflines.grep(/^- /).count
    sections = difflines.grep(/^@@ /).count
    files = difflines.grep(/^(\+\+\+)/).count
    weight = Math.log([additions,deletions].max * sections + 1, 10)
    age = Time.now - pr.created_at

    if index?
      # Ship to Elasticsearch
      index(es, pr, {
        "repo" => repo,
        "age" => age,
        "diff" => diff,
        "files" => files,
        "additions" => additions,
        "deletions" => deletions,
        "sections" => sections,
        "weight" => weight
      })
    end

    cla_signed = false
    if cla_uri.nil?
      raise "Missing --cla-uri"
    end

    cla_result = check_cla(repo, pr, cla_uri)
    if cla?
      status = cla_result["status"] == "error" ? "failure" : "success"
      logger.info("Setting CLA status", :status => status, :repo => repo, :pr => pr.number, :sha => pr.head.sha)
      client.create_status(pr.base.repo.full_name, pr.head.sha, status,
                           :description => cla_result["message"],
                           :context => "CLA",
                           :target_url => "https://github.com/#{repo}/blob/master/CONTRIBUTING.md#contribution-steps")
    end

    if label?
      # Update the label in Github

      current_labels = client.issue(repo, pr.number).labels.map { |x| x.name }.select { |x| x =~ /^O\(\d+\)$/ }
      if cla_result["status"] == "error"
        # CLA check failed; remove all the O(c) labels
        logger.info("CLA check failed; Removing O(c) labels", :pr => pr.number, :current_labels => current_labels)
        current_labels.each do |label|
          client.remove_label(repo, pr.number, label)
        end
      else
        label = "O(#{weight.to_i})"

        # Remove any existing O(c) labels except for the desired one.
        current_labels.delete(label)

        if current_labels.any?
          logger.info("Removing old labels", :pr => pr.number, :current_labels => current_labels)
          current_labels.each do |label|
            client.remove_label(repo, pr.number, label)
          end
        end
        logger.info("Setting label", :label => label, :pr => pr.number)
        client.add_labels_to_an_issue(repo, pr.number, [ label ])
      end
    end

  end # def process_pr

  def index(es, pr, extra)
    insist { extra }.is_a?(Hash)
    doc = pr.to_hash
    # Do time conversions
    doc.keys.grep(/_at$/).each do |key|
      # Some keys like 'created_at' are Time objects
      # Let's convert them to ISO8601 strings for Elasticsearch
      doc[key].tap do |value|
        doc[key] = value.strftime("%Y-%m-%dT%H:%M:%S%z") if value.is_a?(Time)
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

  # This method requires @cla_uri being set before it'll work.
  def check_cla(repo, pr, cla_uri)
    logger.info("Checking CLA", :repo => repo, :pr => pr.number)
    uri = URI.parse(cla_uri)
    conn = Faraday.new(:url => "#{uri.scheme}://#{uri.host}")
    conn.basic_auth(uri.user, uri.password)
    response = conn.get(uri.path, :repository => repo, :number => pr.number)
    JSON.parse(response.body)
  end
end # class PullRequestClassifier

PullRequestClassifier.run
