#!/bin/sh

# BEFORE YOU RUN THIS, CHANGE ../nixos/configuration.nix TO SHOW INSTALLED NIX RELEASE
# DO NOT CHANGE IT IN THE GITHUB REPO NAME LOCATED IN ../flake.nix

sudo cp /etc/nixos/hardware-configuration.nix ../nixos/
sudo nixos-rebuild switch --flake ..
for config in $(ls ../config)
do
  stow -t $HOME ../config/$config
done
