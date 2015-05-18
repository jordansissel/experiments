#!/usr/bin/env ruby
# encoding: utf-8

require "clamp"
require_relative "github_client"

class GithubIssueMigrator < Clamp::Command
  include GithubClient
  include LoggerMixin

  option "--debug", :flag, "Enable debugging", :default => false
  parameter "SOURCE", "The github issue to migrate."
  parameter "DESTINATION", "The destination to migrate to"

  def execute
    issue = client.issue(source_project, source_issue)
    annotated_body = "(This issue was originally filed by @#{issue.user.login} at #{source})\n\n---\n\n" + issue.body

    if issue.state == "closed"
      puts "This issue is already closed. Nothing to migrate."
      return 1
    end

    # Create the new issue
    new_issue = client.create_issue(destination_project, issue.title, annotated_body)

    # Comment on the old issue about the migration, and close it.
    client.add_comment(source_project, source_issue, "For Logstash 1.5.0, we've moved all plugins to individual repositories, so I have moved this issue to #{new_issue.html_url}. Let's continue the discussion there! :)")
    client.close_issue(source_project, source_issue)

    puts "Successfully migrated to: #{new_issue.html_url}"
    nil
  end # def execute

  def source_project
    @source_project ||= source.gsub(%r{^https?://github.com/}, "").gsub(%r{issues/\d+$}, "")
  end

  def source_issue
    @source_issue ||= source[/\d+$/].to_i
  end

  def destination_project
    @destination_project ||= destination.gsub(%r{^https?://github.com/}, "")
  end

end # class GithubIssueMigrator

GithubIssueMigrator.run
