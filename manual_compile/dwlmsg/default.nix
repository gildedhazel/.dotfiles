# default nix
let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-26.05";
  pkgs = import nixpkgs {
    config = { };
    overlay = [ ];
  };
in
{
  dwlmsg = pkgs.callPackage ./dwlmsg-build.nix { };
}
