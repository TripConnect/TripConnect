import ServiceBase from "./serviceBase";
import { StatusCode } from "../../utils/graphql";

let grpc = require('@grpc/grpc-js');

export default class ChatService extends ServiceBase {
    private static STUB_ADDRESS = "localhost";
    private static STUB_PORT = 31073;
    private static stub = new super.backendProto.Chat(
        `${ChatService.STUB_ADDRESS}:${ChatService.STUB_PORT}`, grpc.credentials.createInsecure());

    public static async createConversation(
        { ownerId, name, type, memberIds  }: { ownerId: string, name: string, type: string, memberIds: string[] }): Promise<any> {
        return new Promise((resolve, reject) => {
            ChatService.stub.CreateConversation({ ownerId, name, type, memberIds }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }
}
