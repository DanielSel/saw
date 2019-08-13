# Developer Guide

## Build Process

### Tools
Docker Builder Images: https://hub.docker.com/u/saw1
    * **build-protobuf**: Custom protobuf environment for generating gRPC service stubs
    * **build-turris-ipkg**: Build opkg package for Turris Omnia 3.x or 4.x
    * **build-turris-ipkg-node**: Build NPM package installed via opkg (because of precompiles) for Turris Omnia 3.x or 4.x
    * **deploy-bintray**: Deploy an opkg package to our bintray openwrt repository

All of the stuff are easily reusable high-level abstractions and contain as little inflexible structure as possible. E.g. the difference between compiling for TOS 3.x or 4.x is merely using the v3 or v4 tag on the builder images, even though the build processes are wildly different.

### Dependencies
*(That we have to build or configure ourselves)*
1. Nodejs + NPM > V10.0 for OpenWRT 18.06
2. gRPC as npm module (no official prebuilt binaries for ARM, we have to compile ourselves)
3. FreeRADIUS 3.x (official packages for OpenWRT 18.06 available, has to be configured)
4. Protobuf (compile-time only)

## CI / CD
* Pipeline definitions for all components + dependencies are in tools/pipelines
* You can find all pipelines & recent builds on Azure DevOps: https://dev.azure.com/danielsel/saw/_build
* SAW Service releases are published to: https://dl.bintray.com/danielsel/saw-dev-openwrt/
* Racoon App releases are published to: https://install.appcenter.ms/users/daniel.sel/apps/racoon/distribution_groups/public