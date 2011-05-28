
class User
  attr_accessor :uid
  attr_accessor :name
  attr_accessor :home
  attr_accessor :groups

  def initialize(data=nil)
    if data
      @uid = data[:uid]
      @name = data[:name]
      @home = data[:home]
      @groups = data[:groups] or []
    end
  end # def initialize

  def home
    @home or "/home/#{@name}"
  end
end # class User

def find_user(name)
  # fake 'find user' like ActiveRecord might provide.
  # Returns a 'User' object.
  # Pretend we did a database lookup and turned that wonderful result
  # into a new User object for you to love and adore.
  return User.new(:uid => 3, :name => name)
end

def find_user_with_existing(name, user)
  # Similar to 'find_user' but you are responsible for giving me a User instance
  # to manipulate. Pretend again we did a database lookup and are simply
  # updating the 'User' instance with your result.
  user.name = name
  user.uid = 3
  return user
end

iterations = 10_000_000_000
ENGINE = (RUBY_ENGINE rescue "ruby")

def time(name, iterations, &block)
  start = Time.now
  1.upto(iterations).each &block

  duration = Time.now - start
  rate = iterations / duration

  printf("%25.25s | %5s/%7s | %8.2f | %6d\n", name, ENGINE, RUBY_VERSION, duration, rate)
end

#time("find_user", iterations) do
  #find_user("jls")
#end

reuser = User.new
time("find_user_with_existing", iterations) do
  find_user_with_existing("jls", reuser)
end
