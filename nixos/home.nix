{ config, pkgs, ... }:

# Not sure why I couldn't get this plugin to work, but oh well
# let
#   tmux-everforest = pkgs.tmuxPlugins.mkTmuxPlugin {
#     pluginName = "tmux-everforest";
#     version = "";
#     src = pkgs.fetchFromGitHub {
#       owner = "TanglingTreats";
#       repo = "tmux-everforest";
#       rev = "b709e43";
#       # tag = "b709e43";
#       sha256 = "sha256-LQovIDU+dC0O7hf8cc/9Wfd7eVLeMmoxWd9N/VjFMSA=";
#     };
#   };
# in

{
  # Change these to fit your user
  home.username = "hazel";
  home.homeDirectory = "/home/hazel";

  # Enables tmux for the user
  programs.tmux = {
    enable = true;
    plugins = with pkgs; [
      tmuxPlugins.resurrect
      # tmux-everforest
    ];
    clock24 = true;
    keyMode = "vi";
    escapeTime = 10;
    extraConfig = "";
  };

  # Why do I have this both here and in configuration.nix?
  # Because you need both for some reason (I think?)
  stylix = {
    enable = true;
    base16Scheme = ./theme.yaml;
  };

  # No touchy
  home.stateVersion = "25.11";
  programs.home-manager.enable = true;
}
