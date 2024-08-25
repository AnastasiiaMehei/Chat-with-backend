import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    messages: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photo: { type: String },
    lastMessageDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const chatsCollection = mongoose.model('Chat', chatSchema);
