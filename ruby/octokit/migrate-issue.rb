#!/usr/bin/env ruby
# encoding: utf-8

require "clamp"
require_relative "mixins/github"
require_relative "mixins/logger"
require_relative "mixins/cla"

class GithubIssueMigrator < Clamp::Command
  include Mixin::GitHub
  include Mixin::Logger
  include Mixin::ElasticCLA

  parameter "SOURCE", "The github issue to migrate."
  parameter "DESTINATION", "The destination to migrate to"

  def execute
    issue = github.issue(source_project, source_issue)
    if issue[:pull_request]
      migrate_pull(issue)
    else
      migrate_issue(issue)
    end
  end

  def migrate_issue(issue)
    annotated_body = "(This issue was originally filed by @#{issue.user.login} at #{source})\n\n---\n\n" + issue.body

    if issue.state == "closed"
      puts "This issue is already closed. Nothing to migrate."
      return 1
    end

    # Create the new issue
    new_issue = github.create_issue(destination_project, issue.title, annotated_body)

    # Comment on the old issue about the migration, and close it.
    github.add_comment(source_project, source_issue, "For Logstash 1.5.0, we've moved all plugins to individual repositories, so I have moved this issue to #{new_issue.html_url}. Let's continue the discussion there! :)")
    github.close_issue(source_project, source_issue)

    puts "Successfully migrated to: #{new_issue.html_url}"
    nil
  end # def execute

  def migrate_pull(issue)
    if cla_uri.nil?
      puts "Missing --cla-uri. Cannot migrate a PR without this."
      return 1
    end

    comment = <<-COMMENT
For Logstash 1.5.0, we've moved all plugins (and grok patterns) to individual repositories. Can you move this pull request to https://github.com/#{destination_project}?

This sequence of steps _may_ help you do this migration:

1. Fork this repository
2. Clone your fork

  ```shell
  git clone #{issue.user.html_url}/#{source_project.split("/")[1]}.git
  ```

3. Create a branch:

  ```shell
  git checkout -b my-branch-name
  ```

4. Apply the patches from this PR into your branch:

  ```shell
  curl -s #{source}.patch | git am
  ```

  This should take your commits from this PR and commit them to your new local branch.

5. Push!

  ```shell
  git push origin my-branch-name
  ```

6. Open a new PR against https://github.com/#{destination_project}
    COMMENT

    cla_ok, cla_message = cla_status(source_project, source_issue, cla_uri)
    cla_message = cla_message[0,1].downcase + cla_message[1..-1]

    if !cla_ok
      comment << <<-COMMENT
7. Sign the CLA

  Our CLA check indicates that #{cla_message}. See our [contributor agreement](http://www.elasticsearch.org/contributor-agreement/) for more details. :)
      COMMENT
    end

    github.add_comment(source_project, source_issue, comment)
    github.close_issue(source_project, source_issue)
    puts "Added note to contributor for migration to #{destination_project}"
  end

  def source_project
    @source_project ||= source.gsub(%r{^https?://github.com/}, "").gsub(%r{(issues|pull)/\d+$}, "")
  end

  def source_issue
    @source_issue ||= source[/\d+$/].to_i
  end

  def destination_project
    @destination_project ||= destination.gsub(%r{^https?://github.com/}, "")
  end

end # class GithubIssueMigrator

GithubIssueMigrator.run
