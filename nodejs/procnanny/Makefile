
OBJ=lib/nanny.js lib/program.js lib/interface.js
all: $(OBJ)

lib/nanny.js: lib/program.js lib/interface.js

%.js: %.coffee
	~/node_modules/coffee-script/bin/coffee -c $<
