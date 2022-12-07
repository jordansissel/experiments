#!/bin/sh
# Recommend running this via podman/docker because this script 
# translates the input into shell commands which are then executed.
# 
# Example:
# podman run -i -v $PWD/chaos.sh:/chaos.sh ubuntu sh chaos.sh < input

mkdir /tmp/chaos
cd /tmp/chaos

# Convert the ls/cd command history and output into new shell commands
# Then run them!. This awk invocation reads from stdin.
awk '

# Root directory is /tmp/chaos
$2 == "cd" && $3 == "/" { print("cd /tmp/chaos") }

# Run cd commands as-is
$2 == "cd" && $3 != "/" { print("cd " $3) }

# dir means a directory by this name exists, so create it.
/^dir / { print "mkdir " $2 }

# a number means a file with a given size exists, so create it
# with the contents being the file size text
/^[0-9]/ { print "echo " $1 " > " $2 }
' | sh

find_dir_usage() {
  # Find all directories
  # Then, for each directory, sum the numbers stored in each file within the
  # directory with no search depth limit.
  # This gets each directory's total size.
  find -type d -print0 \
    | xargs -0n1 sh -c 'echo -n "$1 " ; find $1 -type f | xargs cat | awk "{ sum += \$1 } END { print sum }"' - 
}

# Cache the result of directory usage stats in a variable. This speeds up the
# script a bit as we only have to find/read files once.
dir_usage="$(find_dir_usage)"


## Part 1
#
# Sum only ones with size 100000 or smaller
echo "$dir_usage" \
  | awk '$NF <= 100000 { sum += $NF } END { print "Part 1: Total sum of directories at most 100000: " sum }'

## Part 2
# Total disk space available is 70000000
# Need unused space of at least 30000000
#
# Find the smallest directory that can be deleted that will result in a
# successful update (enough space)

totalusage="$(echo "$dir_usage" | awk '$1 == "." { print $2 }')"

echo "Part 2, find a directory to remove."

echo "$dir_usage" \
  | awk -v used="$totalusage" -v capacity=70000000 -v needed=30000000 \
  '(capacity - (used-$2)) >= needed { print }' \
  | sort -nk2 \
  | head -n1 
