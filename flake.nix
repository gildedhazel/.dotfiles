{
  description = "My first flake!";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.11";
  };

  outputs = {
    self,
    nixpkgs,
    ...
  }: let
    lib = nixpkgs.lib;
    supportedSystems = ["x86_64-linux"];
    forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    pkgsFor = nixpkgs.legacyPackages;
    # pkgs = import nixpkgs {
    #   config = {};
    #   overlay = [];
    # };
    # dwlmsg-build = nixpkgs.callPackage ./dwlmsg/dwlmsg-build.nix {};
  in {
    nixosConfigurations = {
      nixos = lib.nixosSystem {
        system = "x86_64-linux";
        modules = [./nixos/configuration.nix];
      };
    };
    packages = forAllSystems (system: {
      end-rs = pkgsFor.${system}.callPackage ./end-rs {};
    });
    # end-rs = pkgsFor.${system}.callPackage ./end-rs {};
    # dwlmsg = dwlmsg-build;
  };
}
