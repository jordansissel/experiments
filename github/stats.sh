
user="jordansissel"
#curl http://github.com/api/v2/json/repos/show/$user \
#| jgrep -s repositories.name | sed -e "s,.*,git@github.com:$user/&.git," \
#| xargs -P2 -n1 git clone

for repo in $(find ./ -name '*.git' | xargs -n1 dirname); do
  cd $repo
  git log --date=rfc  --shortstat --format=short --since=2011 --before=2012 \
  | grep 'files changed' | sed -e "s,^,$1: ,"
done
