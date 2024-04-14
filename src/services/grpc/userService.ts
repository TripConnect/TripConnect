import ServiceBase from "./serviceBase";

let grpc = require('@grpc/grpc-js');

export default class UserService extends ServiceBase {
    static STUB_ADDRESS = "localhost";
    static STUB_PORT = 31072;
    static stub = new super.backendProto.User(
        `${UserService.STUB_ADDRESS}:${UserService.STUB_PORT}`, grpc.credentials.createInsecure());

    static async signin(
        { username, password }: { username: string, password: string }): Promise<any> {
        return new Promise((resolve, reject) => {
            UserService.stub.SignIn({ username, password }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }
}
