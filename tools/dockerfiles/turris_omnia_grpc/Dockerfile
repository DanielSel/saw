FROM turris/turris-os-build:omnia-toolchain

ARG NODE_VERSION=11
ARG GRPC_VERSION=1.18.0

WORKDIR /home/build
COPY node_cross_compile.sh /home/build/node_cross_compile.sh
RUN sudo chmod +x /home/build/node_cross_compile.sh

# Node JS
RUN sudo apt-get update && sudo apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - \
    && sudo apt-get install -y nodejs
# RUN sudo chown -R build /usr/lib/node_modules \
RUN sudo npm install -g node-gyp node-pre-gyp

# Setup node-grpc source
RUN git clone --depth 1 --recursive --branch grpc@${GRPC_VERSION} https://github.com/grpc/grpc-node.git
WORKDIR /home/build/grpc-node/packages/grpc-native-core
RUN npm install

ENTRYPOINT /home/build/node_cross_compile.sh

VOLUME /dist