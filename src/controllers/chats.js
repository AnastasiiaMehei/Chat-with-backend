import { isValidObjectId } from 'mongoose';
import {
  getChatById,
  createChat,
  deleteChat,
  updateChat,
  getAllChats,
} from '../services/chats.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
export const getChatsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const userId = req.user._id;

  const chats = await getAllChats({
    page,
    perPage,
    sortBy,
    sortOrder,
    userId,
  });

  console.log('getChatsController - chats:', chats);

  res.json({
    status: 200,
    message: 'Successfully found chats!',
    data: chats,
  });
};

export const getChatByIdController = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(chatId)) {
      console.error('Invalid chat ID:', chatId);
      return next(createHttpError(400, 'Invalid chat ID'));
    }

    const chat = await getChatById(chatId);
    if (!chat) {
      console.error('Chat not found:', chatId);
      return next(createHttpError(404, 'Chat not found'));
    }

    if (!chat.userId) {
      console.error('Chat does not have a userId:', chat);
      return next(createHttpError(500, 'Chat does not have a userId'));
    }

    if (chat.userId.toString() !== userId.toString()) {
      console.error('Forbidden access to chat:', chatId);
      return next(createHttpError(403, 'Forbidden'));
    }

    res.json({
      status: 200,
      message: `Successfully found chat with id ${chatId}!`,
      data: chat,
    });
  } catch (error) {
    console.error('Error in getChatByIdController:', error);
    next(error);
  }
};

export const createChatController = async (req, res) => {
  const userId = req.user._id;
  const chatData = { ...req.body, userId };

  const chat = await createChat(chatData);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a chat!',
    data: chat,
  });
};

export const deleteChatController = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(chatId)) {
    return next(createHttpError(400, 'Invalid chat ID'));
  }

  const chat = await getChatById(chatId);
  if (!chat) {
    return next(createHttpError(404, 'Chat not found'));
  }

  if (chat.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Forbidden'));
  }

  await deleteChat(chatId);
  res.status(204).send();
};

export const patchChatController = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  // =========================================
  const photo = req.file;
  let photoUrl;
  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  const result = await updateChat(chatId, {
    ...req.body,
    photo: photoUrl,
  });
  if (!result) {
    next(createHttpError(404, 'Chat not found'));
    return;
  }
  res.json({
    status: 200,
    message: `Successfully patched a chat!`,
    data: result.chat,
  });

  // ==========================================
  if (!isValidObjectId(chatId)) {
    return next(createHttpError(400, 'Invalid chat ID'));
  }

  const chat = await getChatById(chatId);
  if (!chat) {
    return next(createHttpError(404, 'Chat not found'));
  }

  if (chat.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Forbidden'));
  }

  const updatedChat = await updateChat(chatId, req.body);
  res.json({
    status: 200,
    message: 'Successfully updated chat!',
    data: updatedChat,
  });
};

export const upsertChatController = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(chatId)) {
    return next(createHttpError(400, 'Invalid chat ID'));
  }

  const chat = await getChatById(chatId);
  if (chat && chat.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Forbidden'));
  }

  const updatedChat = await updateChat(chatId, req.body, {
    upsert: true,
  });
  const status = updatedChat.isNew ? 201 : 200;
  res.status(status).json({
    status,
    message: 'Successfully upserted a chat!',
    data: updatedChat.chat,
  });
};
