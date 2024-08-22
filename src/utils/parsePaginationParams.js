export const parsePaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const perPage = parseInt(query.perPage, 10) || 10;
  return { page, perPage };
};

export const parseSortParams = (query) => {
  const sortBy = query.sortBy || '_id';
  const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
  return { sortBy, sortOrder };
};
