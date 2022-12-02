# Shell solutions

Input file: [input](input)

The shell below uses some tools I've maintained for years, notably, [fex](https://github.com/jordansissel/fex) and a shell function `sum` which I use frequently when doing light number crunching as a sysadmin. That function is:

```sh
sum () {
	[ "${1#-F}" != "$1" ] && SP=${1}  && shift
	[ "$#" -eq 0 ] && set -- 0
	key="$(_awk_col "$1")"
	awk $SP "{ x+=$key } END { printf(\"%f\n\", x) }"
}
```

You can use awk or cut instead of fex in these cases, but my muscle memory leans on fex for processing like this.

## Part 1

I wrote some notes to compute scores from each game outcome (A X through C Z). Generate a sed expression from this and then sum the scores.


The notes file I used for this: [map](map)

```
cat input | sed -e "$(fex 1 2 3 < map | xargs -L1 sh -c 'echo s/$1 $2/$3/\;' -)"  | sum
```

## Part 2

The notes file I used for this: [map2](map2)

```
cat input | sed -e "$(fex 1 2 3 < map2 | xargs -L1 sh -c 'echo s/$1 $2/$3/\;' -)"  | sum
```
