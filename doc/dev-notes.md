# Development Notes

## General

### Symlinks (Windows)
We are using symlinks to link the utility classes into the sources of service and client since tsc path resolution is a PITA...
* `.\utils\create_symlinks.cmd`
or
* `mklink /D clients\nodejs\src\utils ..\..\..\utils\src`
* `mklink /D router\src\utils ..\..\utils\src`

If you are using truffle for contract deployment
* `mklink smart_contracts\contracts\saw_contract.sol ..\saw_contract.sol`

## Smart Contract Deployment

### Truffle
* `truffle.cmd compile`
* `truffle.cmd migrate --reset --network ropsten`

## gRPC Service Creation (Node.js)

### Generate stubs from .proto (Windows)
* `npm install -g grpc-tools`
* `.\utils\generate_grpc_stubs.cmd`


#### SAW Service
* ``for /F "usebackq delims=" %A in (`where grpc_tools_node_protoc_plugin.cmd`) do protoc --plugin=protoc-gen-grpc=%A --js_out=import_style=commonjs,binary:"router\src\grpc" --grpc_out="router\src\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, js)

* ``for /F "usebackq delims=" %A in (`where protoc-gen-ts.cmd`) do protoc --plugin=protoc-gen-ts=%A --ts_out="router\src\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, ts .d)

#### Utils
* ``for /F "usebackq delims=" %A in (`where grpc_tools_node_protoc_plugin.cmd`) do protoc --plugin=protoc-gen-grpc=%A --js_out=import_style=commonjs,binary:"utils\grpc" --grpc_out="utils\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, js)

* ``for /F "usebackq delims=" %A in (`where protoc-gen-ts.cmd`) do protoc --plugin=protoc-gen-ts=%A --ts_out="utils\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, ts .d)




### Test gRPC Services
* evans (https://github.com/ktr0731/evans/releases)