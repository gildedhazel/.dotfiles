{ config, pkgs, ... }:
let
  tmux-everforest = pkgs.tmuxPlugins.mkTmuxPlugin {
    pluginName = "tmux-everforest";
    version = "";
    src = pkgs.fetchFromGitHub {
      owner = "TanglingTreats";
      repo = "tmux-everforest";
      rev = "b709e43";
      # tag = "b709e43";
      sha256 = "sha256-LQovIDU+dC0O7hf8cc/9Wfd7eVLeMmoxWd9N/VjFMSA=";
    };
  };
in {
  home.username = "hazel";
  home.homeDirectory = "/home/hazel";

  gtk = {
    enable = true;
    cursorTheme = {
      name = "Rose Pine Cursor";
      package = pkgs.rose-pine-cursor;
    };
    gtk3.extraConfig = {
      Settings = ''
        gtk-application-prefer-dark-theme=1
      '';
    };
    gtk4.extraConfig = {
      Settings = ''
        gtk-application-prefer-dark-theme=1
      '';
    };
  };

  programs.tmux = {
    enable = true;
    plugins = with pkgs; [ tmuxPlugins.resurrect tmux-everforest ];
    clock24 = true;
    keyMode = "vi";
    escapeTime = 10;
    extraConfig = "";
  };

  home.stateVersion = "25.11";
  programs.home-manager.enable = true;
}
