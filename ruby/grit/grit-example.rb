require "rubygems"
require "grit"
repo = Grit::Repo.new(".")
branch = "master"

5.times do |i|
  index = repo.index
  index.add("path/to/thing", "Hello world #{i}\n")
  head = repo.get_head(branch)
  if head
    parents = [head.commit]
    index.current_tree = head.commit.tree
  else
    parents = []
  end
  p :commit => i
  index.commit("Commit #{i}", :parents => parents, :head => branch)
end

def ls(tree, path="")
  tree.contents.each do |obj|
    if obj.is_a?(Grit::Tree)
      ls(obj, File.join(path, obj.name))
    else
      p File.join(path, obj.name) => obj.data
    end
  end
end

#ls(repo.tree(branch))
