import User from '../models/user.model.js';

/**
 * Populate the user with the data of cycles for the provided searched keyword and return the user object.
 *
 * @param {String} userId - The ID of the user to populate.
 * @param {Object} search - The variable (key) to search.
 * @returns {Promise<User|null>} - A promise that resolves to the user object with the cycles populated or null if not found.
 */
export async function populateWithCyclesBy(userId, search) {
  try {
    /**
     * The user object with populated cycle data.
     * @type {User | null}
     */
    const user = await User.findById(userId).populate({
      path: '_cycles',
      match: search,
    }).exec();

    return user || null;
  } catch (err) {
    throw err;
  }
}

/**
 * Return a user with the populated cycle data.
 *
 * @param {String} userId - The ID of the user to populate.
 * @returns {Promise<User|null>} - A promise that resolves to the user object with the cycles populated or null if not found.
 */
export async function populateWithCycles(userId) {
  try {
    /**
     * The user object with populated cycle data.
     * @type {User|null}
     */
    const user = await User.findById(userId).populate({
      path: '_cycles',
    }).exec();

    return user || null;
  } catch (err) {
    throw err;
  }
}
