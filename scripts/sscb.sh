#!/bin/sh

grim -g "$(slurp -or)" - | wl-copy
# grim -o "$(dwlmsg -g -o | grep 'selmon 1' | cut -d ' ' -f1)" - | wl-copy
