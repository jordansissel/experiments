#!/usr/bin/perl

my %names;
while (<>) {
	chomp;

	genldif(split(":", $_));
}

sub genldif {
	my ($user,$pass,$uid,$gid,$gecos,$homedir,$shell) = @_;

	my $name = $gecos;
	$name =~ s/,.*$//;
	$name = "UNKNOWN NAME" if length($name) == 0;
	my @names = split(/\s+/,$name);
	my $fname = $names[0];
	my $lname = $names[$#names];

	if (exists($names{$name})) {
		print STDERR "'$name' already exists? ($user)\n";
		return;
	}
	$names{$name} = $uid;

	print << "LDIF";
dn: cn=$name,ou=Users,dc=csh,dc=rit,dc=edu
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: posixAccount
objectClass: inetorgPerson
ou: Users
cn: $name
uid: $user
uidNumber: $uid
gidNumber: $gid
givenName: $fname
sn: $lname
gecos: $gecos
homeDirectory: $homedir
loginShell: $shell
mail: $user\@csh.rit.edu
userPassword: {KERBEROS}$user\@CSH.RIT.EDU

LDIF
}

