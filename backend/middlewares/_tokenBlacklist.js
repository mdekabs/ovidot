import { promises as fs } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const blacklistPath = process.env.BLACKLIST;

/**
 * Function that reads the blacklist JSON file.
 * @returns {Promise<Array>} - A promise that resolves to an array of tokens or an empty list.
 */
const readBlacklist = async () => {
  try {
    const data = await fs.readFile(blacklistPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

/**
 * Updates the blacklist by adding a token.
 * @param {String} token - User token.
 */
export const updateBlacklist = async (token) => {
  const blacklistData = await readBlacklist();
  blacklistData.push(token);

  // Write the updated blacklist array back to the file
  await fs.writeFile(blacklistPath, JSON.stringify(blacklistData));
};

/**
 * Checks if a token is blacklisted.
 * @param {String} token - The user token for authorization.
 * @returns {Promise<Boolean>} - A promise that resolves to true if the token is blacklisted, false if it isn't.
 */
export const isTokenBlacklisted = async (token) => {
  const blacklistData = await readBlacklist();
  return blacklistData.includes(token);
};
