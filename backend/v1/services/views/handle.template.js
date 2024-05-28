import ejs from 'ejs';
import util from 'util';
import { logger } from '../../middleware/logger.js';

// Get current year
const year = new Date().getFullYear();

// Convert ejs.renderFile into a function that returns a Promise
const renderFile = util.promisify(ejs.renderFile);

/**
 * Renders the welcome template with the given data.
 *
 * @param {object} data - The data object containing the necessary information for rendering the template.
 * @return {Promise} A Promise that resolves to the rendered template as a string.
 */
export async function renderWelcomeTemplate(data) {
  // Define the data
  const welcome = {
    username: data.username, companyName: 'ImadeCorp Ltd',
    productName: 'OVIDOT', productUrl: 'https://ovidot.com',
    forgetPasswordUrl: 'https://ovidot.com/forget-password',
    supportEmail: "support@ovidot.com", helpUrl: 'https://ovidot.com/help',
    year: year, loginUrl: 'https://ovidot.com/login',
  };

  try {
    const result = await renderFile('./v1/services/views/welcome.ejs', welcome);
    return result;
  } catch(err) {
    logger.error(err);
  }
};

/**
 * Renders the goodbye template.
 *
 * @return {Promise} The result of rendering the template.
 */
export async function renderGoodbyeTemplate(data) {
  // Define the data
  const goodbye = {
    username: data.username, companyName: 'ImadeCorp Ltd',
    productName: 'OVIDOT', productUrl: 'https://ovidot.com',
    supportEmail: "support@ovidot.com", year: year
  };

  try {
    const result = await renderFile('./v1/services/views/goodbye.ejs', goodbye);
    return result;
  } catch(err) {
    logger.error(err);
  }
};

/**
 * Renders the forget template.
 *
 * @param {Object} req - The request object.
 * @param {Object} data - The data object.
 * @param {string} resetLink - The reset link.
 * @return {Promise<string>} The rendered result.
 */
export async function renderForgetTemplate(req, data, resetLink) {
  // Define the data
  const forgetPass = { username: data.username, companyName: 'ImadeCorp Ltd',
    productUrl: 'https://ovidot.com',
    productName: 'OVIDOT', productUrl: 'https://ovidot.com',
    resetLink: resetLink, year: year, osName: req.useragent.os,
    browserName: req.useragent.browser, supportEmail: "support@ovidot.com"
  };

  try {
    const result = await renderFile('./v1/services/views/forgetPass.ejs', forgetPass);
    return result;
  } catch(err) {
    logger.error(err);
  }
};
