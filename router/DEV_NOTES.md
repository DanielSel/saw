# Development Notes

## gRPC Service Creation (Node.js)

### Generate stubs from .proto
* `npm install grpc-tools`
* ``for /F "usebackq delims=" %A in (`where grpc_tools_node_protoc_plugin.cmd`) do protoc --plugin=protoc-gen-grpc=%A --js_out=import_style=commonjs,binary:"router\etc\saw\saw_service\grpc" --grpc_out="router\etc\saw\saw_service\grpc" common\saw_pop.proto common\saw_auth.proto`` (windows)

### Test gRPC Services
* evans (https://github.com/ktr0731/evans/releases)