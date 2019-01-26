# Development Notes

## gRPC Service Creation (Node.js)

### Generate stubs from .proto
* `npm install grpc-tools`
* ``for /F "usebackq delims=" %A in (`where grpc_tools_node_protoc_plugin.cmd`) do protoc --plugin=protoc-gen-grpc=%A --js_out=import_style=commonjs,binary:generated --grpc_out=generated saw.proto``