default: run
WORKDIR=mysql

run: | $(WORKDIR)/log/binlog.index
	/usr/libexec/mysqld --defaults-file=my.cnf --datadir=$$PWD/mysql

$(WORKDIR) $(WORKDIR)/data $(WORKDIR)/log $(WORKDIR)/share:
	mkdir $@

# Mysql is retarded.
$(WORKDIR)/log/binlog.index:
	touch $@


$(WORKDIR)/share/mysql: | $(WORKDIR)/share
	ln -s /usr/share/mysql $@
