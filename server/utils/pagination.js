const getPagination = (page = 1, limit = 10, totalRecords) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (currentPage - 1) * pageSize;

  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    skip,
    limit: pageSize,
    metadata: {
      totalRecords,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};

module.exports = { getPagination };