#!/bin/sh

for config in $(ls ../config)
do
  stow -t $HOME -d ../config $config
done
