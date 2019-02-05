# Development Notes

## gRPC Service Creation (Node.js)

### Generate stubs from .proto
* `npm install grpc-tools`
* `.\utils\generate_grpc_stubs.cmd`


#### SAW Service
* ``for /F "usebackq delims=" %A in (`where grpc_tools_node_protoc_plugin.cmd`) do protoc --plugin=protoc-gen-grpc=%A --js_out=import_style=commonjs,binary:"router\etc\saw\saw_service\grpc" --grpc_out="router\etc\saw\saw_service\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, js)

* ``for /F "usebackq delims=" %A in (`where protoc-gen-ts.cmd`) do protoc --plugin=protoc-gen-ts=%A --ts_out="router\etc\saw\saw_service\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, ts .d)

#### Utils
* ``for /F "usebackq delims=" %A in (`where grpc_tools_node_protoc_plugin.cmd`) do protoc --plugin=protoc-gen-grpc=%A --js_out=import_style=commonjs,binary:"utils\grpc" --grpc_out="utils\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, js)

* ``for /F "usebackq delims=" %A in (`where protoc-gen-ts.cmd`) do protoc --plugin=protoc-gen-ts=%A --ts_out="utils\grpc" -I common saw_pop.proto saw_auth.proto`` (windows, ts .d)




### Test gRPC Services
* evans (https://github.com/ktr0731/evans/releases)