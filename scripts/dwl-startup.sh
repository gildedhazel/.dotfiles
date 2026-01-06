#!/bin/sh

# Kill already running duplicate process
_ps="eww end-rs swaybg"
for _prs in $_ps; do
    if [ "$(pidof "${_prs}")" ]; then
         killall -9 "${_prs}"
    fi
 done

# Start our applications
# wpctl set-volume @DEFAULT_AUDIO_SINK@ 0.69
# wlr-randr --output DP-1 --mode 2560x1440@300 --right-of HDMI-A-2 --left-of DP-2
ln -sf /run/current-system/sw/bin/eww $HOME/.local/bin/ &
./monitors.sh &
./sleep.sh &
swaybg --output '*' --mode center  --image $HOME/.dotfiles/wallpapers/EIA4Kv2.png &
~/.cargo/bin/end-rs daemon &
playerctl daemon &
eww open bar &
eww open bar1 &
eww open bar2 &
exec dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=wlroots
