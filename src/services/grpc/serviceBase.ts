let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader');

export default class ServiceBase {
    static PROTO_PATH = process.env.PROTO_URL;

    static backendProto = grpc
        .loadPackageDefinition(
            protoLoader.loadSync(
                ServiceBase.PROTO_PATH,
                {
                    keepCase: true,
                    longs: String,
                    enums: String,
                    defaults: true,
                    oneofs: true
                }
            )
        )
        .backend;
}