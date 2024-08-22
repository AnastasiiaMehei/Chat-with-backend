import Joi from 'joi';

export const createChatSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  surname: Joi.string().min(3).max(20).required(),
});
export const updateChatSchema = Joi.object({
  name: Joi.string().min(3).max(20).optional(),
  surname: Joi.string().min(3).max(20).required(),
});
