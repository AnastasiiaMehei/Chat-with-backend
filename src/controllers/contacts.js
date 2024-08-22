// src/controllers/contacts.js
import { isValidObjectId } from 'mongoose';
import {
  getContactById,
  createContact,
  deleteContact,
  updateContact,
  getAllContacts,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';
export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const userId = req.user._id;

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    userId,
  });

  console.log('getContactsController - contacts:', contacts);

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(contactId)) {
      console.error('Invalid contact ID:', contactId);
      return next(createHttpError(400, 'Invalid contact ID'));
    }

    const contact = await getContactById(contactId);
    if (!contact) {
      console.error('Contact not found:', contactId);
      return next(createHttpError(404, 'Contact not found'));
    }

    if (!contact.userId) {
      console.error('Contact does not have a userId:', contact);
      return next(createHttpError(500, 'Contact does not have a userId'));
    }

    if (contact.userId.toString() !== userId.toString()) {
      console.error('Forbidden access to contact:', contactId);
      return next(createHttpError(403, 'Forbidden'));
    }

    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    console.error('Error in getContactByIdController:', error);
    next(error); // Pass the error to the error handler middleware
  }
};

export const createContactController = async (req, res) => {
  const userId = req.user._id;
  const contactData = { ...req.body, userId };

  const contact = await createContact(contactData);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(contactId)) {
    return next(createHttpError(400, 'Invalid contact ID'));
  }

  const contact = await getContactById(contactId);
  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  if (contact.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Forbidden'));
  }

  await deleteContact(contactId);
  res.status(204).send();
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;
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
  const result = await updateContact(contactId, {
    ...req.body,
    photo: photoUrl,
  });
  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }
  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });

  // ==========================================
  if (!isValidObjectId(contactId)) {
    return next(createHttpError(400, 'Invalid contact ID'));
  }

  const contact = await getContactById(contactId);
  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  if (contact.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Forbidden'));
  }

  const updatedContact = await updateContact(contactId, req.body);
  res.json({
    status: 200,
    message: 'Successfully updated contact!',
    data: updatedContact,
  });
};

export const upsertContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(contactId)) {
    return next(createHttpError(400, 'Invalid contact ID'));
  }

  const contact = await getContactById(contactId);
  if (contact && contact.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Forbidden'));
  }

  const updatedContact = await updateContact(contactId, req.body, {
    upsert: true,
  });
  const status = updatedContact.isNew ? 201 : 200;
  res.status(status).json({
    status,
    message: 'Successfully upserted a contact!',
    data: updatedContact.contact,
  });
};
