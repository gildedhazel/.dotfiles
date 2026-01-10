#!/bin/sh

DWLMSG="$HOME/.local/bin/dwlmsg"
MONITOR="HDMI-A-2"

buf=""
while IFS= read -r line; do
  set -- $line
  tag=$1
  tag_num=$2
  state=$3

  # When we see "tags", it's the start of a NEW update
  if [ "$tag" = "tags" ]; then
    # Print the previous update's buffer (if exists)
    [ -n "$buf" ] && echo "$buf"
    buf=""
    continue
  fi

  # Process workspace state
  if [ "$state" -eq 1 ]; then
    icon=""
  else
    icon="○"
  fi
  buf+=" $icon"
done < <("$DWLMSG" -o "$MONITOR" -w -t)
