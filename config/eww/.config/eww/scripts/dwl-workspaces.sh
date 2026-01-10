#!/bin/sh

DWLMSG="$HOME/.local/bin/dwlmsg"
MONITOR="DP-2"

print_workspaces() {
  buf=""
  while IFS= read -r line; do
    set -- $line
    tag_num=$2
    state=$3

    if [ "$state" -eq 1 ]; then
      icon=""
      class="focused"
    else
      icon="○"
      class="empty"
    fi
    buf="$buf (eventbox :cursor \"hand\" (button :class \"$class\" :onclick \"$DWLMSG -s -t $tag_num\" \"$icon\"))"
  done < <( "$DWLMSG" -o "$MONITOR" -g -t | grep -v 'tags')
  echo "(box :halign \"center\" :valign \"center\" :vexpand true :hexpand true $buf)"
}
while IFS= read -r  output; do
  print_workspaces
done < <("$DWLMSG" -o "$MONITOR" -w -t)
