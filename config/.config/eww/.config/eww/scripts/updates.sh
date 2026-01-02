#!/bin/sh

updates_arch=$(checkupdates 2> /dev/null | wc -l );
[ -z "$updates_arch" ] && updates_arch=0

updates_aur=$(yay -Qua 2> /dev/null | wc -l);
[ -z "$updates_aur" ] && updates_aur=0

updates_flat=$(flatpak remote-ls --updates 2> /dev/null | wc -l);
[ -z "$updates_flat" ] && updates_flat=0

updates=$((updates_arch + updates_aur + updates_flat))
echo "$updates"

