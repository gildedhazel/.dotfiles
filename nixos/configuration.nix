# Edit this configuration file to define what should be installed on
# your system. Help is available in the configuration.nix(5) man page, on
# https://search.nixos.org/options and in the NixOS manual (`nixos-help`).
{
  config,
  lib,
  pkgs,
  ...
}: {
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
  boot.loader.systemd-boot.enable = true;

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

  nix.settings.experimental-features = ["nix-command" "flakes"];

  # ---------------------------------------------------------------------------------------------------------------------------
  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.hazel = {
    description = "Hazel";
    isNormalUser = true;
    extraGroups = ["wheel"]; # Enable ‘sudo’ for the user.
    shell = pkgs.zsh;
    home = "/home/hazel";
    packages = with pkgs; [
      tree
    ];
  };

  # List packages installed in system profile.
  # You can use https://search.nixos.org/ to find more packages (and options).
  environment.systemPackages = with pkgs; [
    vim # Do not forget to add an editor to edit configuration.nix! The Nano editor is also installed by default.
    wget
    git

    # My preferred terminal
    kitty

    # Shows disk space per mounted partition in terminal
    dysk

    # Vim-like web browser
    qutebrowser

    # Configure sound devices
    pavucontrol
    helvum
    pamixer

    # Package manager used for installing proton-ge
    asdf-vm

    # Allow CDM content in qutebrowser and chromium browsers
    widevine-cdm

    # Make (for building programs)
    gnumake

    # Make dependency
    pkg-config

    # Screenshots
    jq
    wl-clipboard-rs
    grim
    slurp

    # DWL dependencies
    libinput
    libxcb
    libxkbcommon
    pixman
    wayland
    wayland-protocols
    wlroots_0_18
    libx11
    xwayland
    wayland-scanner
    swaybg

    # Status bar widget
    eww

    # Application launcher
    rofi

    # Allows for easy sh scriptable monitor config
    wlr-randr
    amdgpu_top
    playerctl

    # Rust package manager
    cargo

    # Neovim plugin dependencies
    gcc
    unzip
    python3

    # OBS Studio
    (pkgs.wrapOBS {
      plugins = with pkgs.obs-studio-plugins; [
        wlrobs
        obs-vaapi
      ];
    })

    # Media
    vlc
    tidal-hifi

    # Discord Client
    vesktop

    # Dotfiles Manager
    stow

    # Used to reshade games using reshade-shaders
    mangohud
    vkbasalt
    mesa-demos
    vulkan-tools
    goverlay
  ];

  # Hack Nerd Font
  fonts.packages = with pkgs; [
    nerd-fonts.hack
  ];

  # Neovim
  programs.neovim = {
    enable = true;
  };
  # Allows Mason to install a few Neovim LSPs/Formatters
  programs.npm.enable = true;

  # I prefer zsh over bash or fish
  programs.zsh.enable = true;

  # Installs mesa for AMD GPUs
  hardware.graphics.enable = true;

  # If you want Hyprland instead of DWL
  # programs.hyprland = {
  #   enable = true;
  #   withUWSM = false;
  #   xwayland.enable = true;
  # };

  # DWL is my preferred WM, and it's pulling from a local directory with my custom config
  programs.dwl = {
    enable = true;
    package = pkgs.dwl.overrideAttrs {
      src = ../dwl;
    };
  };

  # Login scren; calls dwl-startup.sh script which sets everything up
  services.greetd = {
    enable = true;
    settings.default_session.command = "${pkgs.greetd.tuigreet}/bin/tuigreet -c 'dwl -s ~/.dotfiles/scripts/dwl-startup.sh'";
  };

  # Virtualization
  programs.virt-manager.enable = true;
  users.groups.libvirtd.members = ["hazel"];
  virtualisation.libvirtd.enable = true;
  virtualisation.spiceUSBRedirection.enable = true;

  # Steam...enough said
  programs.steam = {
    enable = true;
    remotePlay.openFirewall = true;
    dedicatedServer.openFirewall = true;
    localNetworkGameTransfers.openFirewall = true;
  };

  # You have to have this for specific programs. If you're missing this portion, it'll tell you when you go to rebuild
  nixpkgs.config.allowUnfreePredicate = pkg:
    builtins.elem (lib.getName pkg) [
      "steam"
      "steam-original"
      "steam-unwrapped"
      "steam-run"
      "widevine-cdm"
      "castlabs-electron"
    ];
}
