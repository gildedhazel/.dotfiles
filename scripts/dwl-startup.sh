#!/bin/sh

# Kill already running duplicate process
_ps="eww end-rs swaybg swayidle"
for _prs in $_ps; do
    if [ "$(pidof "${_prs}")" ]; then
         killall -9 "${_prs}"
    fi
 done

# Start our applications
ln -sf /run/current-system/sw/bin/eww $HOME/.local/bin/
wlr-randr --output HDMI-A-2 --mode 1920x1080@60 --pos 0,240
wlr-randr --output DP-2 --mode 1920x1080@144.001007 --transform 90 --pos 4480,0
wlr-randr --output DP-1 --mode 2560x1440@300 --pos 1920,240
# playerctl daemon &
eww open-many bar bar1 bar2
# ~/.cargo/bin/end-rs daemon &
swaybg --output '*' --mode center  --image $HOME/.dotfiles/wallpapers/EIA4Kv2.png &
swayidle timeout 4500 "dpms-off" &
exec dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=wlroots
