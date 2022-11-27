from distutils.core import Command

class example(Command):
    description = "example setup.py subcommand"
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        path = "/tmp/example"
        print("Writing to {}".format(path))
        output = open(path, "w")
        output.write("Hello")
