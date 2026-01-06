#!/bin/sh

swayidle timeout 60 "wlr-randr --output DP-1 --off; \
                     wlr-randr --output DP-2 --off; \
		     wlr-randr --output HDMI-A-2 --off" \
	 resume "wlr-randr --output DP-1 --on; \
	         wlr-randr --output DP-2 --on; \
		 wlr-randr --output HDMI-A-2 --on; \
		 ./monitors.sh"
