#!/bin/sh

DWLMSG="$HOME/.local/bin/dwlmsg"
MONITOR="HDMI-A-2"

while IFS= read -r line; do
  echo $line | grep -Po '(?<=title ).*'
done < <("$DWLMSG" -o "$MONITOR" -w -c)
