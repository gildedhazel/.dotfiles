# You shouldn't need to change much in here
# Probably just change your user and version if needed

# This file took me ages to figure out every time I added to it
# It's spooky if you aren't a nix wizard

{
  description = "My first flake!";

  inputs = {
    # Shorthand for the github repo for our packages
    nixpkgs.url = "nixpkgs/nixos-26.05";

    # Github repo for home-manager
    home-manager = {
      url = "github:nix-community/home-manager/release-26.05";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # Github repo for stylix
    stylix = {
      url = "github:nix-community/stylix/release-25.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    self.submodules = true;
  };

  outputs =
    {
      self,
      nixpkgs,
      home-manager,
      stylix,
      ...
    }:
    let
      lib = nixpkgs.lib;
      system = "x86_64-linux";
    in
    {
      nixosConfigurations = {
        nixos = lib.nixosSystem {
          inherit system;
          modules = [
            ./nixos/configuration.nix
            stylix.nixosModules.stylix
            home-manager.nixosModules.home-manager
            {
              home-manager.useGlobalPkgs = true;
              home-manager.useUserPackages = true;
              # Obviously change 'hazel' to be your user
              home-manager.users.hazel = ./nixos/home.nix;
            }
          ];
        };
      };

    };
}
