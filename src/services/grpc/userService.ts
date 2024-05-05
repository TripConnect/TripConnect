import ServiceBase from "./serviceBase";
import { StatusCode } from "../../utils/graphql";

let grpc = require('@grpc/grpc-js');

export default class UserService extends ServiceBase {
    private static STUB_ADDRESS = "localhost";
    private static STUB_PORT = 31072;
    private static stub = new super.backendProto.User(
        `${UserService.STUB_ADDRESS}:${UserService.STUB_PORT}`, grpc.credentials.createInsecure());

    public static async signin(
        { username, password }: { username: string, password: string }): Promise<any> {
        return new Promise((resolve, reject) => {
            UserService.stub.SignIn({ username, password }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public static async signup(
        { username, password, displayName, avatarURL }: { username: string, password: string, displayName: string, avatarURL: string | null }): Promise<any> {
        return new Promise((resolve, reject) => {
            UserService.stub.SignUp({ username, password, displayName, avatarURL }, (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public static async findUser(
        { userId }: { userId: string }): Promise<any> {
        return new Promise((resolve, reject) => {
            UserService.stub.SignUp({ userId }, (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public static async searchUser(
        { term = null, userIds = null }: { term?: string | null, userIds?: string[] | null }): Promise<any> {
        return new Promise((resolve, reject) => {
            UserService.stub.SearchUser({ term, userIds }, (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }
}
