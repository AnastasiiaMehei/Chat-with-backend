import { Router } from 'express';
import chatsRouter from './chats.js';
import authRouter from './auth.js';

const router = Router();

router.use('/chats', chatsRouter);
router.use('/auth', authRouter);

export default router;
