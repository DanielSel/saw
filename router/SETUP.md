# Setup for SAW Router

## Pre-Req
* OpenWRT
* Software Packages:
    * hostapd-utils
    * freeradius3
    * freeradius3-mod-exec
    * freeradius3-mod-eap-ttls
    * node

### Turris Omnia
If you are using Turris Omnia, you need at least version 4.0 --> Follow Instructions on *https://forum.turris.cz/t/turris-os-4-0-here-be-dragons/8384*

### Manually Install gRPC on Router using precompiled binary
`npm install grpc --grpc_node_binary_host_mirror=https://home.in.tum.de/~sel/npm`