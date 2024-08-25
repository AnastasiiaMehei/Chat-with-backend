import Joi from 'joi';

export const createChatSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  surname: Joi.string().min(3).max(30).required(),
  messages: Joi.array().items(Joi.string()).required(),
  photo: Joi.string().uri().optional().allow(null),
  lastMessageDate: Joi.date().optional(),
});
export const updateChatSchema = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  surname: Joi.string().min(3).max(30).optional(),
  messages: Joi.array().items(Joi.string()).optional(),
  photo: Joi.string().uri().optional().allow(null),
  lastMessageDate: Joi.date().optional(),
}).min(1);
