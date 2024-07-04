/**
 * Constants for pagination parameters and default values.
 */
const PAGE_PARAM = "page";
const LIMIT_PARAM = "limit";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

/**
 * Generates pagination links based on the current page and limit.
 *
 * @param {number} page - Current page number.
 * @param {number} limit - Number of items per page.
 * @returns {Object} Object containing pagination links.
 */
function generatePaginationLinks(page, limit) {
  return {
    first: `?${PAGE_PARAM}=${DEFAULT_PAGE}&${LIMIT_PARAM}=${limit}`,
    prev: page > DEFAULT_PAGE && `?${PAGE_PARAM}=${page - 1}&${LIMIT_PARAM}=${limit}`,
    self: `?${PAGE_PARAM}=${page}&${LIMIT_PARAM}=${limit}`,
    next: `?${PAGE_PARAM}=${page + 1}&${LIMIT_PARAM}=${limit}`,
  };
}

/**
 * Express middleware for handling pagination.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function.
 */
function Pagination(req, res, next) {
  try {
    const page = parseInt(req.query[PAGE_PARAM], 10) || DEFAULT_PAGE;
    const limit = parseInt(req.query[LIMIT_PARAM], 10) || DEFAULT_LIMIT;

    res.locals.pagination = {
      page,
      limit,
      hasMorePages: true,
    };

    const links = generatePaginationLinks(page, limit);
    res.locals.pagination.links = Object.fromEntries(Object.entries(links).filter(([_ , value]) => value !== null));

    res.locals.pagination.hasMorepages = res.locals.pagination.links.next !== undefined;

    next();
  }
  catch (error) {
    res.locals.pagination = null;
    res.status(500).json({ error: "internal server error" });
  }
}
export default Pagination;
