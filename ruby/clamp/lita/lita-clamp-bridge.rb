require "clamp"
require "shellwords"

class Foo < Clamp::Command
  option "--foo", :flag, "Foo"
  def execute
    puts "Foo: #{foo?}"
  end
end

module Lita
  module Handlers
    class Clamp < Handler
      def self.clamp_delegate(command_class)
        lambda do |request|
          name, *args = Shellwords.shellsplit(request.message.body)
          cmd = command_class.new(name)
          begin
            cmd.run(args)
          rescue ::Clamp::UsageError => e
            request.reply(e.to_s)
            request.reply(cmd.help)
          rescue ::Clamp::HelpWanted => e
            request.reply(cmd.help)
          end
        end
      end

      # Delegate 'foo ...' commands via Lita to a Clamp command, Foo
      route(/^foo/, :command => true, :help => { "foo ..." => "foo command" }, &clamp_delegate(Foo))
      Lita.register_handler(self)
    end
  end
end
