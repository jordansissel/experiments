require "clamp"

class PullRequestClassifier < Clamp::Command

  option "--dry", :flag, "Do a dry run", :default => true

  def execute
    require "octokit"
    require "diff_parser"
    client = Octokit::Client.new(:netrc => true)
    client.login

    client.auto_paginate = true
    pulls = client.pull_requests("elasticsearch/logstash")

    # TODO(sissel): Skip any pull requests that have been labeled already
    # Fetch diff of each PR, allocate labels accordingly
    http = Faraday.new(:url => "https://github.com") do |faraday|
      faraday.request :url_encoded
      faraday.adapter Faraday.default_adapter
    end # http

    out = File.new("/tmp/pr.csv", "w")
    require "elasticsearch"
    es = Elasticsearch::Client.new
    pulls.each do |pr|
      response = http.get(pr.diff_url)
      diff = response.body
      difflines = diff.split("\n")

      additions = difflines.grep(/^\+ /).count
      deletions = difflines.grep(/^- /).count
      sections = difflines.grep(/^@@ /).count
      files = difflines.grep(/^(\+\+\+)/).count

      doc = pr.to_hash

      # Do time conversion
      age = Time.now - pr.created_at
      doc.keys.grep(/_at$/).each do |key|
        value = doc[key]
        next if value.nil?
        if value.is_a?(Time)
          p value => value.class
          doc[key] = value.strftime("%Y-%m-%dT%H:%M:%S%z")
        end
      end

      weight = Math.log([additions,deletions].max * sections + 1, 10)

      doc.merge!(
        "age" => age,
        "diff" => diff,
        "files" => files,
        "additions" => additions,
        "deletions" => deletions,
        "sections" => sections,
        "weight" => weight,
      )

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
    end
    out.close
  end
end

PullRequestClassifier.run
