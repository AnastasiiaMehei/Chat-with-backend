import { Router } from 'express';
import chatsRouter from './chats.js';
import authRouter from './auth.js';

const router = Router();

router.use('/chat', chatsRouter);
router.use('/auth', authRouter);

export default router;
