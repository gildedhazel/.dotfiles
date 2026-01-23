{
  config,
  pkgs,
  ...
}: {
  home.username = "hazel";
  home.homeDirectory = "/home/hazel";

  home.stateVersion = "25.11";
  programs.home-manager.enable = true;
}
