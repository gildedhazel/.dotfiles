#!/bin/sh
export XDG_CURRENT_DESKTOP=dwl
export WAYLAND_DISPLAY=wayland-0
systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=dwl
exec dwl -s ~/.dotfiles/scripts/dwl-startup.sh
