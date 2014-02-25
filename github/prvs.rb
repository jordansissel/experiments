pulls=(1000..1200)

target="1.4.x"

pulls.each do |pr|
  ref = "upstream/pull/#{pr}"
  system("git rev-parse #{ref} > /dev/null 2> /dev/null")
  next unless $?.success?

  branches = `git branch --contains #{ref}`.tr(" *", "").split("\n")
  next if branches.empty?

  # Is this PR merged?
  if branches.include?("master")
    if !branches.include?(target)
      puts "#{ref}   # missing #{target}"
    #else
      #puts "#{ref}   # ok #{target}"
    end
  end
end
