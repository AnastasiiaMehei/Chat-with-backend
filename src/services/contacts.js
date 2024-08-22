import { contactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy = '_id',
  sortOrder = SORT_ORDER.ASC,
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const contactsQuery = contactsCollection.find({ userId });

  const contactsCount = await contactsCollection
    .find({ userId })
    .merge(contactsQuery)
    .countDocuments();

  console.log('getAllContacts - contactsCount:', contactsCount);

  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(contactsCount, perPage, page);
  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId) => {
  try {
    const contact = await contactsCollection.findById(contactId);
    if (!contact) {
      console.error('getContactById - Contact not found:', contactId);
    }
    return contact;
  } catch (error) {
    console.error('Error in getContactById:', error);
    throw error;
  }
};

export const createContact = async (payload) => {
  const contact = await contactsCollection.create(payload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await contactsCollection.findOneAndDelete({
    _id: contactId,
  });

  return contact;
};

export const patchContact = async (id, contactData) => {
  return await contactsCollection.findByIdAndUpdate(id, contactData, {
    new: true,
  });
};

export const updateContact = async (contactId, payload, options = {}) => {
  const rawResult = await contactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
