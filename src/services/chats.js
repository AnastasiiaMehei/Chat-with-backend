import { chatsCollection } from '../db/models/chats.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../chats/index.js';

export const getAllChats = async ({
  page,
  perPage,
  sortBy = '_id',
  sortOrder = SORT_ORDER.ASC,
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const chatsQuery = chatsCollection.find({ userId });

  const chatsCount = await chatsCollection
    .find({ userId })
    .merge(chatsQuery)
    .countDocuments();

  console.log('getAllChats - chatsCount:', chatsCount);

  const chats = await chatsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(chatsCount, perPage, page);
  return {
    data: chats,
    ...paginationData,
  };
};

export const getChatById = async (chatId) => {
  try {
    const chat = await chatsCollection.findById(chatId);
    if (!chat) {
      console.error('getCChatById - Chat not found:', chatId);
    }
    return chat;
  } catch (error) {
    console.error('Error in getChatById:', error);
    throw error;
  }
};

export const createChat = async (payload) => {
  const chat = await chatsCollection.create(payload);
  return chat;
};

export const deleteChat = async (chatId) => {
  const chat = await chatsCollection.findOneAndDelete({
    _id: chatId,
  });

  return chat;
};

export const patchChat = async (id, chatData) => {
  return await chatsCollection.findByIdAndUpdate(id, chatData, {
    new: true,
  });
};

export const updateChat = async (chatId, payload, options = {}) => {
  const rawResult = await chatsCollection.findOneAndUpdate(
    { _id: chatId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    chat: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
