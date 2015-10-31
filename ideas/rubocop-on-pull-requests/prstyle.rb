require "clamp"
require "json"
require "English"
require "fileutils"
require "git"
require "git_diff_parser"
require "cabin"
require "stud/temporary"

CodeReviewer = Class.new(Clamp::Command) do
  option "--debug", :flag, "Enable debug-level logging"
  parameter "PR_URL", "The URL to the PR to review", :attribute_name => "pr_url"

  def help
    <<-INTRO.gsub(/^      /, "") + super
      Automatic review of certain aspects of a patch.

      Example:

        prstyle.rb https://github.com/jordansissel/fpm/pull/908

    INTRO
  end

  def logger
    @logger = Cabin::Channel.get
  end

  def project_url
    @project_url ||= pr_url.gsub(%r{/pull/\d+$}, "")
  end

  def project_name
    project_url.gsub(%r{^https://github.com/}, "")
  end

  def git_dir
    @git_dir ||= Stud::Temporary.pathname
  end

  def pr
    @pr ||= pr_url[/\d+$/].to_i
  end

  def rubocop_yml(git_dir)
    File.join(git_dir, ".rubocop.yml")
  end

  def offenses_file
    @offenses_file ||= Stud::Temporary.pathname
  end

  def system(*args)
    logger.debug? && logger.debug("Running shell", :args => args)
    Kernel.system(*args)
  end

  def setup_logging
    logger.subscribe(STDOUT)
    logger.level = debug? ? :debug : :info
  end

  def execute
    setup_logging
    prepare_to_review
    
    gitdiff = compute_diff
    gitdiff.entries.each do |entry|
      patch = GitDiffParser.parse(entry.patch)

      offenses = analyze(File.join(git_dir, entry.path))
      require "pry"
      binding.pry
    end
    nil
  ensure
    FileUtils.rm_r(git_dir) if File.directory?(git_dir)
  end # def execute

  def prepare_to_review
    prepare_workspace
  end

  def prepare_workspace
    clone(project_url)
    fetch_pr(pr)
    git.checkout("pull/#{pr}")
  end

  def compute_diff
    pr_info = github.pull_request(project_name, pr)
    base_commit = pr_info.base.sha
    merge_base = git.lib.instance_eval { command("merge-base HEAD #{base_commit}") }
    git.diff(merge_base)
  end

  def analyze(file)
    # Read the diff and find all files changed
    # Get list of files and line-ranges that are new
    # For each file changed, 
    #   Analyze, report anything within the "new lines" ranges
    #
    offenses = rubocop(git_dir, file)
  end

  def clone(uri)
    logger.info? && logger.info("Git clone", :uri => uri, :git_dir => git_dir)
    Git.clone(uri, git_dir)
  end

  def git
    @git ||= Git.open(git_dir)
  end

  def fetch_pr(pr)
    git.lib.instance_eval { command("fetch origin refs/pull/#{pr}/head:refs/remotes/origin/pull/#{pr}") }
  end

  def rubocop(git_dir, path)
    if !File.file?(rubocop_yml(git_dir))
      puts "No .rubocop.yml found in #{project_url}. Skipping review."
      return
    end

    system("cd #{git_dir}; rubocop -c #{rubocop_yml(git_dir)} --format json -o #{offenses_file} #{path}")
    return JSON.parse(File.read(offenses_file))
  end

  def github
    require "octokit"
    require "faraday"
    # This requires you have ~/.netrc setup correctly
    # I don't know if it works with 2FA
    @github ||= Octokit::Client.new(:netrc => true).tap do |client|
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
