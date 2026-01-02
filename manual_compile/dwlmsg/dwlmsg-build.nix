{
  stdenv,
  pkg-config,
  wayland-scanner,
  gnumake,
  wayland,
}:
stdenv.mkDerivation {
  pname = "dwlmsg";
  version = "1.0";

  src = builtins.path {
    name = "dwlmsg-build";
    path = ./.;
  };

  nativeBuildInputs = [
    pkg-config
    gnumake
  ];

  buildInputs = [
    wayland
    wayland-scanner
  ];

  # outputs = ["out"];

  makeFlags = [
    "PKG_CONFIG=${stdenv.cc.targetPrefix}pkg-config"
    "WAYLAND_SCANNER=wayland-scanner"
    #   "PREFIX=$(out)"
  ];

  # buildPhase = ''
  #   make clean
  #   make
  # '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out/bin
    cp dwlmsg $out/bin
    runHook postInstall
  '';

  # meta = {
  #   # homepage = "https://github.com/tomaskallup/dwl/";
  #   # description = "Dynamic window manager for Wayland";
  #   # longDescription = ''
  #   #   dwl is a compact, hackable compositor for Wayland based on wlroots. It is
  #   #   intended to fill the same space in the Wayland world that dwm does in X11,
  #   #   primarily in terms of philosophy, and secondarily in terms of
  #   #   functionality. Like dwm, dwl is:

  #   #   - Easy to understand, hack on, and extend with patches
  #   #   - One C source file (or a very small number) configurable via config.h
  #   #   - Limited to 2000 SLOC to promote hackability
  #   #   - Tied to as few external dependencies as possible
  #   # '';
  #   # license = lib.licenses.gpl3Only;
  #   # maintainers = [ lib.maintainers.AndersonTorres ];
  #   # inherit (wayland.meta) platforms;
  # mainProgram = "dwlmsg";
  # };
}
