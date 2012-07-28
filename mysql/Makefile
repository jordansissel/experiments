default: run
WORKDIR=mysql

# Give mysqld the --gdb flag so you can ^C it.
run: | $(WORKDIR)/log/binlog.index
	/usr/libexec/mysqld --defaults-file=my.cnf --datadir=$$PWD/mysql --gdb

shell: 
	mysql --defaults-file=my.cnf -u root

clean:
	-[ -d $(WORKDIR) ] && rm -rf $(WORKDIR)

$(WORKDIR):
	mysql_install_db --defaults-file=my.cnf --datadir=$$PWD/mysql

$(WORKDIR)/data $(WORKDIR)/log: | $(WORKDIR)
	mkdir $@

# Mysql is retarded.
$(WORKDIR)/log/binlog.index: | $(WORKDIR)/log
	touch $@
