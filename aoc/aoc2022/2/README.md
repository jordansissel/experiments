# Shell solutions

Input file: [input](input)

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
