// src/routes/chats.js
import { Router } from 'express';
import {
  getChatsController,
  getChatByIdController,
  createChatController,
  deleteChatController,
  patchChatController,
  upsertChatController,
} from '../controllers/chats.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createChatSchema, updateChatSchema } from '../validation/chats.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getChatsController));
router.get('/:chatId', ctrlWrapper(getChatByIdController));
router.post(
  '/',
  upload.single('photo'),
  validateBody(createChatSchema),
  ctrlWrapper(createChatController),
);
router.delete('/:chatId', ctrlWrapper(deleteChatController));
router.patch(
  '/:chatId',
  upload.single('photo'),
  validateBody(updateChatSchema),
  ctrlWrapper(patchChatController),
);
router.put(
  '/:chatId',
  upload.single('photo'),
  validateBody(createChatSchema),
  ctrlWrapper(upsertChatController),
);

export default router;
