for /F "usebackq delims=" %%A in (`where grpc_tools_node_protoc_plugin.cmd`) do set PLUGIN_GRPC=%%A
for /F "usebackq delims=" %%A in (`where protoc-gen-ts.cmd`) do set PLUGIN_TS=%%A

protoc --plugin=protoc-gen-grpc=%PLUGIN_GRPC% --js_out=import_style=commonjs,binary:"router\src\grpc" --grpc_out="router\src\grpc" -I common saw_pop.proto saw_auth.proto
protoc --plugin=protoc-gen-ts=%PLUGIN_TS% --ts_out="router\src\grpc" -I common saw_pop.proto saw_auth.proto
protoc --plugin=protoc-gen-grpc=%PLUGIN_GRPC% --js_out=import_style=commonjs,binary:"utils\grpc" --grpc_out="utils\grpc" -I common saw_pop.proto saw_auth.proto
protoc --plugin=protoc-gen-ts=%PLUGIN_TS% --ts_out="utils\grpc" -I common saw_pop.proto saw_auth.proto

