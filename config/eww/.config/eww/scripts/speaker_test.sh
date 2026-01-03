#!/bin/sh

icon=""
while read -r line; do
  output=$(echo $line)
  test=$(echo $output | awk '{print $3}')
  if [[ $test = "[MUTED]" ]]; then
    volume="MUTED"
  else
    volume=$(echo $output | awk '{ print $2 }')
  fi
  echo "{\"content\": \"$volume\", \"icon\": \"$icon\"}"
done < <(wpctl get-volume @DEFAULT_AUDIO_SINK@)
