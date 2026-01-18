#!/bin/sh

# Adds flathub and installs Gimp with PhotoGIMP customization
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub org.gimp.GIMP
cp -r ../extras/GIMP/ $HOME/.config/

nix-build ../manual_compile/dwlmsg
