require "clamp"
require "json"
require "faraday"
require "fileutils"
require "cabin"
require "diff_parser"
require "stud/temporary"

CodeReviewer = Class.new(Clamp::Command) do
  option "--debug", :flag, "Enable debug-level logging"
  parameter "https://github.com/user/project/pull/1234", "The URL to the PR to review", :attribute_name => "pr_url"

  def logger
    @logger = Cabin::Channel.get
  end

  def project_url
    @project_url ||= pr_url.gsub(/\/pull\/\d+$/, "")
  end

  def git_dir
    @git_dir ||= Stud::Temporary.pathname
  end

  def pr
    @pr ||= pr_url[/\d+$/].to_i
  end

  def rubocop_yml
    File.join(git_dir, ".rubocop.yml")
  end

  def offenses_file
    @offenses_file ||= Stud::Temporary.pathname
  end

  def system(*args)
    p :sh => args
    Kernel.system(*args)
  end

  def execute
    logger.subscribe(STDOUT)
    logger.level = debug? ? :debug : :info
    
    # Check it out from git
    system("git clone #{project_url} #{git_dir}")
    # Fetch the PR
    system("git -C #{git_dir} fetch origin refs/pull/#{pr}/head:refs/remotes/origin/pull/#{pr}")
    # Run rubocop
    if !File.file?(rubocop_yml)
      puts "No .rubocop.yml found in #{project_url}. Skipping review."
      return
    end

    system("rubocop -c #{rubocop_yml} --format json -o #{offenses_file} #{git_dir}")
    puts $?

    puts "Wrote result to #{offenses_file}"

    # Diff against the target branch
    # Comment on any added lines in the diff
    nil
  ensure
    FileUtils.rm_r(git_dir) if File.directory?(git_dir)
  end # def execute

  def client
    require "octokit"
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
end.run
