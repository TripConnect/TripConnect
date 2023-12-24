import mongoose, { Document, Schema, Model } from 'mongoose';

// Define a TypeScript interface for the User document
interface IMessages extends Document {
    messageId: String,
    conversationId: String,
    fromUserId: String,
    messageContent: String,
    createdAt: Date,
}

const MessagesSchema = new Schema<IMessages>({
    messageId: String,
    conversationId: String,
    fromUserId: String,
    messageContent: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Messages: Model<IMessages> = mongoose.model('messages', MessagesSchema);

export default Messages;
