import ServiceBase from "./serviceBase";
import { StatusCode } from "../../utils/graphql";

let grpc = require('@grpc/grpc-js');

export default class ChatService extends ServiceBase {
    private static STUB_ADDRESS = "localhost";
    private static STUB_PORT = 31073;
    private static stub = new super.backendProto.Chat(
        `${ChatService.STUB_ADDRESS}:${ChatService.STUB_PORT}`, grpc.credentials.createInsecure());

    public static async createConversation(
        { ownerId, name, type, memberIds }: { ownerId: string, name: string, type: string, memberIds: string[] }): Promise<any> {
        return new Promise((resolve, reject) => {
            ChatService.stub.CreateConversation({ ownerId, name, type, memberIds }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public static async searchConversations(
        { type, memberIds, term, page = 1, limit = 50, messageLimit = 10 }:
            { type?: string | null, memberIds?: string[] | null, term?: string | null, page?: number | null, limit?: number | null, messageLimit?: number | null }): Promise<any> {
        return new Promise((resolve, reject) => {
            ChatService.stub.SearchConversations({ type, memberIds, term, page, limit, messageLimit }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public static async findConversation(
        { conversationId, page = -1, limit = 100 }: { conversationId: string, page?: number, limit?: number }): Promise<any> {
        return new Promise((resolve, reject) => {
            ChatService.stub.FindConversation({ conversationId, page, limit }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public static async createChatMessage(
        { conversationId, fromUserId, messageContent }: { conversationId: string, fromUserId: string, messageContent: string }): Promise<any> {
        return new Promise((resolve, reject) => {
            ChatService.stub.CreateChatMessage({ conversationId, fromUserId, messageContent }, (error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }
}
