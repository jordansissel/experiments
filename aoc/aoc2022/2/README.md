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

This function gives me a shortcut to summing a column in a given output. For example, 'ls -l | sum 5' will sum the 5th colum (file size) from the `ls -l` output.

You can use awk or cut instead of fex in these cases, but my muscle memory leans on fex for processing like this.

## Part 1

I wrote some notes to compute scores from each game outcome (A X through C Z). Generate a sed expression from this and then sum the scores.

I liked this solution because I was already *writing* the `map` file as a form of design notes and preparation prior to coding.

The notes file I used for this: [map](map)

```
cat input | sed -e "$(fex 1 2 3 < map | xargs -L1 sh -c 'echo s/$1 $2/$3/\;' -)"  | sum
```

This solution translates the 'map' text into sed expressions which replace a given round, like "A X" with the score "4".

## Part 2

The notes file I used for this: [map2](map2)

```
cat input | sed -e "$(fex 1 2 3 < map2 | xargs -L1 sh -c 'echo s/$1 $2/$3/\;' -)"  | sum
```

Same exact code as above except I modified the original score map notes for the scoring change in part 2.
