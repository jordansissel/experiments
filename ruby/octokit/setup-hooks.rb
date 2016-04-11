require 'octokit'
require "clamp"

cli = Class.new(Clamp::Command) do

  HOOK_EVENTS = %w(commit_comment create delete deployment deployment_status
                   fork gollum issue_comment issues member page_build public
                   pull_request pull_request_review_comment push release status
                   team_add watch)

  option "--github-token", "GITHUB_TOKEN", "Your github auth token", :required => true
  #option "--hipchat-token", "HIPCHAT_TOKEN", "Your hipchat admin auth token", :required => true
  #option "--hipchat-room", "HIPCHAT_ROOM", "The room to send notifications to", :required => true
  option "--clacheck-url", "CLACHECK_URL", "The url (w/ user+pass) to set for cla checking", :required => true
  option "--slack-hook-url", "SLACK_HOOK_URL", "The url to send hooks for Slack.", :required => true

  parameter "ORGANIZATION", "The github organization"
  parameter "[REPOSITORY] ...", "The repository name"

  def execute
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
      #setup_hipchat(organization, r,
        #"room" => hipchat_room,
        #"auth_token" => hipchat_token
      #)
      setup_slack(organization, r, slack_hook_url)
      setup_clacheck(organization, r)
      remove_old_hooks(organization, r)
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

  def setup_hipchat(org, repo, config, options={})
    hook_name = "hipchat"
    full_repo_name = "#{org}/#{repo}"
    puts "Configuring hipchat hook on #{full_repo_name}."
    hook_config = {
      "notify" => 1,
      "quiet_labels" => 1,
      "quiet_assigning" => 1,
    }.merge(config)
    hook_options = {
      "events" => HOOK_EVENTS 
    }.merge(options)
    raise ArgumentError, "Missing 'auth_token' setting for hipchat" unless hook_config.include?("auth_token")
    raise ArgumentError, "Missing 'room' setting for hipchat" unless hook_config.include?("room")
    client.create_hook(full_repo_name, hook_name, hook_config, hook_options)

    # Verify correct events listing
    hooks = client.hooks(full_repo_name)
    hipchat_hook = hooks.find { |h| h[:name] == hook_name }
    if hipchat_hook.nil?
      raise "No '#{hook_name}' hook found in #{full_repo_name} after creating it? Something is weird."
    end
    if hipchat_hook[:events].sort != hook_options["events"].sort
      puts "Something went wrong with hook event configuration"
      p "Requested" => hook_options["events"].sort
      p "Actual" => hipchat_hook[:events].sort
      p "Difference" => (hook_options["events"].sort - hipchat_hook[:events].sort)
      raise "Some notification events are missing from the #{hook_name} hook on #{full_repo_name}: "
    end
  end

  def setup_clacheck(org, repo)
    full_repo_name = "#{org}/#{repo}"
    puts "Configuring clacheck hook on #{full_repo_name}."

    hooks = client.hooks(full_repo_name)
    existing_hook = hooks.find { |h| h[:name] == "web" && h[:config][:url] == clacheck_url }
    if existing_hook
      # Validate it
      if existing_hook[:config][:content_type] == "json"
        puts "Skipping: The clacheck hook for #{full_repo_name} is already correctly configured."
        return
      end

      # Otherwise, delete it so we can recreate it.
      puts "Deleting incorrectly configured clacheck hook for #{full_repo_name}"
      client.remove_hook(full_repo_name, existing_hook.id)
    end

    hook_config = {
      "url" => clacheck_url,
      "content_type" => "json"
    }
    hook_options = {
      "events" => [ "pull_request" ]
    }
    puts "Creating clacheck hook for #{full_repo_name}"
    client.create_hook(full_repo_name, "web", hook_config, hook_options)
  end

  def setup_slack(org, repo, webhook)
    full_repo_name = "#{org}/#{repo}"
    puts "Configuring slack hook on #{full_repo_name}."

    hooks = client.hooks(full_repo_name)
    existing_hook = hooks.find { |h| h[:name] == "web" && h[:config][:url] == webhook }
    if existing_hook
      # Validate it
      if existing_hook[:config][:content_type] == "json" && existing_hook[:events].sort == HOOK_EVENTS
        puts "Skipping: The webhook hook for #{full_repo_name} is already correctly configured."
        return
      end

      # Otherwise, delete it so we can recreate it.
      puts "Deleting incorrectly configured webhook hook for #{full_repo_name}"
      client.remove_hook(full_repo_name, existing_hook.id)
    end

    hook_config = {
      "url" => webhook,
      "content_type" => "json"
    }
    hook_options = {
      "events" => HOOK_EVENTS 
    }
    puts "Creating webhook hook for #{full_repo_name}"
    client.create_hook(full_repo_name, "web", hook_config, hook_options)
  end


  def remove_old_hooks(org, repo)
    full_repo_name = "#{org}/#{repo}"
    hooks = client.hooks(full_repo_name)

    jenkins = hooks.find { |h| h[:name] == "jenkins" }
    if jenkins
      puts "Deleting old jenkins hook from #{full_repo_name}"
      client.remove_hook(full_repo_name, jenkins.id)
    end
  end
end.run
