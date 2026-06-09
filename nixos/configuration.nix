# Edit this configuration file to define what should be installed on
# your system. Help is available in the configuration.nix(5) man page, on
# https://search.nixos.org/options and in the NixOS manual (`nixos-help`).
{
  config,
  lib,
  pkgs,
  ...
}:

# ---------------------------------------------------------------------------------------------------------------------------
# Below are the standard settings in a configuration file by default, mostly. You shouldn't need to change much in here

{
  imports = [
    # Include the results of the hardware scan.
    ./hardware-configuration.nix
  ];

  # Use the GRUB 2 boot loader.
  # boot.loader.grub.enable = true;
  # boot.loader.grub.efiSupport = true;
  # boot.loader.grub.efiInstallAsRemovable = true;
  # boot.loader.efi.efiSysMountPoint = "/boot/efi";
  # Define on which hard drive you want to install Grub.
  # boot.loader.grub.device = "/dev/sda"; # or "nodev" for efi only

  # We want systemd, hence the line below. It does have a requirement, so look that up
  boot.loader.systemd-boot.enable = true;

  # Computer name. Simple as.
  networking.hostName = "nixos"; # Define your hostname.

  # Configure network connections interactively with nmcli or nmtui.
  networking.networkmanager.enable = true;

  # Set your time zone.
  time.timeZone = "America/Chicago";

  # Configure network proxy if necessary
  # networking.proxy.default = "http://user:password@proxy:port/";
  # networking.proxy.noProxy = "127.0.0.1,localhost,internal.domain";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_US.UTF-8";
  # console = {
  #   font = "Lat2-Terminus16";
  #   keyMap = "us";
  #   useXkbConfig = true; # use xkb.options in tty.
  # };

  # Enable the X11 windowing system.
  # services.xserver.enable = true;

  # Configure keymap in X11
  services.xserver.xkb.layout = "us";
  # services.xserver.xkb.options = "eurosign:e,caps:escape";

  # Enable CUPS to print documents.
  # services.printing.enable = true;

  # Enable sound.
  # services.pulseaudio.enable = true;
  # OR
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
    jack.enable = true;
  };

  # Enable touchpad support (enabled default in most desktopManager).
  # services.libinput.enable = true;

  # Some programs need SUID wrappers, can be configured further or are
  # started in user sessions.
  # programs.mtr.enable = true;
  # programs.gnupg.agent = {
  #   enable = true;
  #   enableSSHSupport = true;
  # };

  # List services that you want to enable:
  # Enable the OpenSSH daemon.
  # services.openssh.enable = true;

  # Open ports in the firewall.
  # networking.firewall.allowedTCPPorts = [ ... ];
  # networking.firewall.allowedUDPPorts = [ ... ];
  # Or disable the firewall altogether.
  # networking.firewall.enable = false;

  # Copy the NixOS configuration file and link it from the resulting system
  # (/run/current-system/configuration.nix). This is useful in case you
  # accidentally delete configuration.nix.
  # system.copySystemConfiguration = true;

  # ---------------------------------------------------------------------------------------------------------------------------
  # Version and experimental features. Leave all of this alone, unless your installed version is different

  # This option defines the first version of NixOS you have installed on this particular machine,
  # and is used to maintain compatibility with application data (e.g. databases) created on older NixOS versions.
  #
  # Most users should NEVER change this value after the initial install, for any reason,
  # even if you've upgraded your system to a new NixOS release.
  #
  # This value does NOT affect the Nixpkgs version your packages and OS are pulled from,
  # so changing it will NOT upgrade your system - see https://nixos.org/manual/nixos/stable/#sec-upgrading for how
  # to actually do that.
  #
  # This value being lower than the current NixOS release does NOT mean your system is
  # out of date, out of support, or vulnerable.
  #
  # Do NOT change this value unless you have manually inspected all the changes it would make to your configuration,
  # and migrated your data accordingly.
  #
  # For more information, see `man configuration.nix` or https://nixos.org/manual/nixos/stable/options#opt-system.stateVersion .
  system.stateVersion = "25.11"; # Did you read the comment?

  nix.settings.experimental-features = [
    "nix-command"
    "flakes"
  ];

  # ---------------------------------------------------------------------------------------------------------------------------
  # Generally, this is the only section you should need to edit substantially

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.hazel = {
    description = "Hazel";
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
    shell = pkgs.zsh;
    home = "/home/hazel";
    packages = with pkgs; [ tree ];
  };

  # List packages installed in system profile.
  # You can use https://search.nixos.org/ to find more packages (and options).
  # I also like https://mynixos.com as a resource. Try to use this one primarily
  environment.systemPackages = with pkgs; [
    # Just leave these all here
    vim # Do not forget to add an editor to edit configuration.nix! The Nano editor is also installed by default.
    wget
    git

    # Manage user side of system
    home-manager

    # My preferred terminal
    kitty

    # Shows disk space per mounted partition in terminal
    dysk

    # Vim-like web browser
    qutebrowser

    # Configure sound devices
    pavucontrol
    crosspipe
    pamixer

    # Package manager used for installing proton-ge
    asdf-vm

    # Allow CDM content in qutebrowser and chromium browsers
    widevine-cdm

    # Make (for building programs)
    gnumake
    # Make dependency
    pkg-config

    # Screenshots; wl-clipboard lets you save screenshot to clipboard
    wl-clipboard-rs
    grim
    slurp

    # DWL dependencies (You may not need all of them)
    libinput
    libxcb
    libxkbcommon
    pixman
    wayland
    wayland-protocols
    wlroots_0_20
    libx11
    xwayland
    wayland-scanner

    # Manage background/wallpaper
    swaybg

    # Track idle state to turn perform action when afk (I turn the screens off)
    swayidle

    # The tool I use to turn screens off. Jiggle mouse to turn back on
    dpms-off

    # Status bar widget
    eww

    # Application launcher
    rofi

    # Notification daemon
    dunst
    libnotify

    # Allows for easy sh scriptable monitor config
    wlr-randr

    # Track gpu utilization (used in eww bars)
    amdgpu_top
    # JSON processor to parse
    jq

    # Allows you to control playing media. Pause, Back, Forward, etc
    playerctl

    # Rust package manager
    cargo

    # Nvim dependencies
    gcc
    unzip
    python3
    fzf
    rdfind
    fd
    zip
    # Nvim tools for nix files (formatter and lsp, respectively)
    nixfmt
    nixd

    # OBS Studio
    (pkgs.wrapOBS {
      plugins = with pkgs.obs-studio-plugins; [
        wlrobs
        obs-vaapi
        # vkcapture allows to capture steam game output
        # normal screen capture sucks on my system
        # add obs-gamecapture before %command% in launch options
        obs-vkcapture
      ];
    })

    # Media
    vlc

    # Discord Client (Vesktop has been having issues for me lately)
    vesktop
    discord

    # Dotfiles Manager
    # Important to preserve .config files in repo to actual via symlinks
    stow

    # Used to reshade games using reshade-shaders
    # Unless you're being sweaty in a competitive game, only get MangoHud
    # MangoHud is easy to set up and is nice for game performance
    # Although, goverlay is a nice configuration tool for MangoHud
    mangohud
    vkbasalt
    mesa-demos
    vulkan-tools
    goverlay

    # Best 'top' upgrade imo
    btop

    # Basic suite for general purpose
    libreoffice

    # Good to have in this day and age
    tor-browser

    # Edit git commit history :)
    git-filter-repo

    # Graphical file manager
    # Useful occasionally when I need to drag and drop into browser
    kdePackages.dolphin

    # Backup browser
    firefox

    # Music player
    strawberry

    # Speaks for itself
    wine

    # Lovely video editor
    kdePackages.kdenlive

    # Tool to manage audio streams. I use this to choose which audio to send to OBS
    # Basically when I record games, I only want that audio, not my youtube video
    # This allows you to set that up. Use in combination with OBS JACK Input
    qpwgraph

    # eww ai
    ollama-rocm

    # E-Books
    calibre

    # Get Reddit karma
    fastfetch

    # See which clients are using x11
    xlsclients
  ];

  # Below, I use programs.____.enable when possible
  # It manages dependencies like a charm, requiring little effort

  # Allows me to be lazy in maintaining my btrfs partition
  services.btrfs.autoScrub.enable = true;

  # Allows calibre to detect kindle
  services.udisks2.enable = true;

  services.hardware.openrgb.enable = true;

  # Hack Nerd Font
  fonts.packages = with pkgs; [ nerd-fonts.hack ];

  # Neovim
  programs.neovim = {
    enable = true;
  };

  # Allows Mason to install a few Neovim LSPs/Formatters
  programs.npm.enable = true;

  # I prefer zsh over bash or fish
  programs.zsh.enable = true;

  # Enable transfer of files over local network
  programs.localsend.enable = true;

  # Installs mesa for AMD GPUs
  hardware.graphics.enable = true;

  # If you want Hyprland instead of DWL
  # programs.hyprland = {
  #   enable = true;
  #   withUWSM = false;
  #   xwayland.enable = true;
  # };

  # DWL is my preferred WM, and it's pulling from a local directory with my custom config
  # If anything in that directory changes, a rebuild will recompile it (restart dwl after)
  programs.dwl = {
    enable = true;
    package = pkgs.dwl.overrideAttrs { src = ../dwl; };
  };

  # Allows me to see video from streaming services on qutebrowser
  nixpkgs.overlays = [
    (final: prev: {
      qutebrowser = prev.qutebrowser.override { enableWideVine = true; };
    })
  ];

  # I use flatpak mainly for gimp, due to the photoshop plugin I use
  # Could I make this happen through nix setup? Maybe, but I have yet to investigate
  services.flatpak.enable = true;

  # xdg-desktop-portal to allow screencasts; I mainly use it for Discord calls
  # You may have to terminate these processes if something goes wrong during screen share
  xdg.portal = {
    enable = true;
    wlr.enable = true;
    extraPortals = [
      pkgs.xdg-desktop-portal-gtk
      pkgs.xdg-desktop-portal-wlr
    ];
    # If you don't use DWL, you can comment this next bit
    config.dwl.default = lib.mkDefault [
      "wlr"
      "gtk"
    ];
  };

  # Login scren; calls dwl-startup.sh script which sets everything up
  services.greetd = {
    enable = true;
    settings.default_session.command = "${pkgs.greetd.tuigreet}/bin/tuigreet -c 'dwl -s ~/.dotfiles/scripts/dwl-startup.sh'";
  };

  # Virtualization
  programs.virt-manager.enable = true;
  users.groups.libvirtd.members = [ "hazel" ];
  virtualisation.libvirtd.enable = true;
  virtualisation.spiceUSBRedirection.enable = true;
  virtualisation.docker.enable = true;

  # Steam
  programs.steam = {
    enable = true;
    remotePlay.openFirewall = true;
    dedicatedServer.openFirewall = true;
    localNetworkGameTransfers.openFirewall = true;
  };

  # Used for performance. Add gamemode before %command% in steam games launch options
  programs.gamemode.enable = true;

  # Used for gtk coloring, such as title bars and menu options in strawberry, libreoffice, etc
  # stylix = {
  #   enable = true;
  #   # You can generate a new theme from an image (read, wallpaper)
  #   # I ran it to generate the theme and handjammed that into a yaml so I don't generate every rebuild
  #   base16Scheme = ./theme.yaml;
  #   polarity = "dark";
  # };

  # You have to have this for specific programs. If you're missing this portion, it'll tell you when you go to rebuild
  nixpkgs.config.allowUnfreePredicate =
    pkg:
    builtins.elem (lib.getName pkg) [
      "steam"
      "steam-original"
      "steam-unwrapped"
      "steam-run"
      "widevine-cdm"
      "castlabs-electron"
      "discord"
    ];
}
