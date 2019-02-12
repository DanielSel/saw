#!/bin/bash
set -e

export STAGING_DIR=${STAGING_DIR:-"/home/build/openwrt/staging_dir"}
ARCH=${ARCH:-arm}
LIBC=${LIBC:-musl}

TOOLCHAIN_DIR=$(ls -d "$STAGING_DIR/toolchain-$ARCH"*)
echo $TOOLCHAIN_DIR

export SYSROOT=$(ls -d "$STAGING_DIR/target-$ARCH"*)

source $TOOLCHAIN_DIR/info.mk # almost a bash script

echo "Cross-compiling for" $TARGET_CROSS

export PATH=$TOOLCHAIN_DIR/bin:$PATH
export CPPPATH=$TARGET_DIR/usr/include
export LIBPATH=$TARGET_DIR/usr/lib

OPTS="-I $SYSROOT/usr/include -L $TOOLCHAIN_DIR/lib -L $SYSROOT/usr/lib"

export CC="${TARGET_CROSS}gcc $OPTS"
export CXX="${TARGET_CROSS}g++ $OPTS"
export AR=${TARGET_CROSS}ar
export RANLIB=${TARGET_CROSS}ranlib
export LINK="${TARGET_CROSS}g++ $OPTS"
export CPP="${TARGET_CROSS}gcc $OPTS -E"
export STRIP=${TARGET_CROSS}strip
export OBJCOPY=${TARGET_CROSS}objcopy
export LD="${TARGET_CROSS}g++ $OPTS"
export OBJDUMP=${TARGET_CROSS}objdump
export NM=${TARGET_CROSS}nm
export AS=${TARGET_CROSS}as

export npm_config_arch=$ARCH

node_versions=( 4.0.0 5.0.0 6.0.0 7.0.0 8.0.0 9.0.0 10.0.0 11.0.0 )
for version in ${node_versions[@]}
do
    node-pre-gyp configure rebuild package testpackage --target=$version --target_arch=$ARCH --target_libc=$LIBC -v
    sudo cp -r build/stage/* /dist/
done
