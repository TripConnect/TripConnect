import mongoose, { Document, Schema, Model } from 'mongoose';

enum ConversationType {
    PRIVATE = 'PRIVATE',
    GROUP = 'GROUP',
}

// Define a TypeScript interface for the User document
interface IConversation extends Document {
    conversationId: String,
    type: ConversationType,
    name: String,
    members: String[],
    createdBy: String,
    createdAt: Date,
    lastMessageAt: Date,
}

const ConversationsSchema = new Schema<IConversation>({
    conversationId: String,
    type: {
        type: String,
        enum: Object.values(ConversationType),
    },
    name: {
        type: String,
        default: null,
    },
    members: [String],
    createdBy: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastMessageAt: Date,
});

const Conversations: Model<IConversation> = mongoose.model('conversations', ConversationsSchema);

export default Conversations;
