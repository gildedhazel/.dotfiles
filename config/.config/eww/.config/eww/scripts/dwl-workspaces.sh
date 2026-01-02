#!/bin/bash

print_workspaces() {
  buf=""
  while read -r line; do
    tag_num=$(echo $line | awk '{ print $3 }')
    tag_test=$(echo $line | awk '{ print $4 }')
    if [ $tag_test -eq "1" ]; then
      ws=$tag_num
      icon=""
      class="focused"
    else
      ws=$tag_num
      icon="○"
      class="empty"
    fi  

    buf="$buf (eventbox :cursor \"hand\" (button :class \"$class\" :onclick \"dwlmsg -s -t $ws\" \"$icon\"))"
  done < <(dwlmsg -g -t | grep 'tag ')
  echo "(box :halign \"center\" :valign \"center\" :vexpand true :hexpand true $buf)"
}
while read -r _
do
  print_workspaces
done < <(dwlmsg -w -t)
