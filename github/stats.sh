
user="jordansissel"
curl http://github.com/api/v2/json/repos/show/$user \
| jgrep -s repositories.name | sed -e "s,.*,git@github.com:$user/&.git," \
| xargs -P2 -n1 git clone
