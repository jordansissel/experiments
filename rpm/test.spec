Name: test
Version: 1.0
Release: 1
Summary: Nope
License: Nope

%description
none

%prep
# noop
%build
# noop
%install
cp -R . %{buildroot}

%clean
# noop

%files
/[\{][\{]?label?[\}][\}].text
