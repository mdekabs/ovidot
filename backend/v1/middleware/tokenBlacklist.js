import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const blacklist = process.env.BLACKLIST;

/**
 * Fuction that reads the blacklist json file
 * @returns - An array of tokens or an empty list.
 * 
 */
function readBlacklist() {
  try {
    const data = readFileSync(blacklist, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Updated a token to the blacklist
 * @param {String} token - User token
 */
export function updateBlacklist(token) {
  const blacklistData = readBlacklist();
  blacklistData.push(token);

  // Write the updated blacklist array back to the file
  writeFileSync(blacklist, JSON.stringify(blacklistData));
}

/**
 * Checks if a token is blacklisted
 * @param {String} token - the user token for authorization 
 * @returns - True - if the token is blacklisted and False - if it isn't.
 */
export function isTokenBlacklisted(token) {
  const blacklistData = readBlacklist();
  return blacklistData.includes(token);
}
