import type { SVGProps } from "react"

export function GetFontLogoClass(platform: string): string {
  if (
    [
      "almalinux",
      "alpine",
      "aosc",
      "apple",
      "archlinux",
      "archlabs",
      "artix",
      "budgie",
      "centos",
      "coreos",
      "debian",
      "deepin",
      "devuan",
      "docker",
      "elementary",
      "fedora",
      "ferris",
      "flathub",
      "freebsd",
      "gentoo",
      "gnu-guix",
      "illumos",
      "kali-linux",
      "linuxmint",
      "mageia",
      "mandriva",
      "manjaro",
      "nixos",
      "openbsd",
      "opensuse",
      "pop-os",
      "raspberry-pi",
      "redhat",
      "rocky-linux",
      "sabayon",
      "slackware",
      "snappy",
      "solus",
      "tux",
      "ubuntu",
      "void",
      "zorin",
    ].indexOf(platform) > -1
  ) {
    return platform
  }
  if (platform == "darwin") {
    return "apple"
  }
  if (["openwrt", "linux", "immortalwrt"].indexOf(platform) > -1) {
    return "tux"
  }
  if (platform == "amazon") {
    return "redhat"
  }
  if (platform == "arch") {
    return "archlinux"
  }
  if (platform.toLowerCase().includes("opensuse")) {
    return "opensuse"
  }
  return "tux"
}

export function GetOsName(platform: string): string {
  if (
    [
      "almalinux",
      "alpine",
      "aosc",
      "apple",
      "archlinux",
      "archlabs",
      "artix",
      "budgie",
      "centos",
      "coreos",
      "debian",
      "deepin",
      "devuan",
      "docker",
      "fedora",
      "ferris",
      "flathub",
      "freebsd",
      "gentoo",
      "gnu-guix",
      "illumos",
      "linuxmint",
      "mageia",
      "mandriva",
      "manjaro",
      "nixos",
      "openbsd",
      "opensuse",
      "pop-os",
      "redhat",
      "sabayon",
      "slackware",
      "snappy",
      "solus",
      "tux",
      "ubuntu",
      "void",
      "zorin",
    ].indexOf(platform) > -1
  ) {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }
  if (platform == "darwin") {
    return "macOS"
  }
  if (["openwrt", "linux", "immortalwrt"].indexOf(platform) > -1) {
    return "Linux"
  }
  if (platform == "amazon") {
    return "Redhat"
  }
  if (platform == "arch") {
    return "Archlinux"
  }
  if (platform.toLowerCase().includes("opensuse")) {
    return "Opensuse"
  }
  return "Linux"
}

export function MageMicrosoftWindows(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M2.75 7.189V2.865c0-.102 0-.115.115-.115h8.622c.128 0 .14 0 .14.128V11.5c0 .128 0 .128-.14.128H2.865c-.102 0-.115 0-.115-.116zM7.189 21.25H2.865c-.102 0-.115 0-.115-.116V12.59c0-.128 0-.128.128-.128h8.635c.102 0 .115 0 .115.115v8.57c0 .09 0 .103-.116.103zM21.25 7.189v4.31c0 .116 0 .116-.116.116h-8.557c-.102 0-.128 0-.128-.115V2.865c0-.09 0-.102.115-.102h8.48c.206 0 .206 0 .206.205zm-8.763 9.661v-4.273c0-.09 0-.115.103-.09h8.621c.026 0 0 .09 0 .142v8.518a.06.06 0 0 1-.017.06a.06.06 0 0 1-.06.017H12.54s-.09 0-.077-.09V16.85z"
      ></path>
    </svg>
  )
}
