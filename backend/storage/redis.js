import { createClient } from "redis";

/**
 * Class representing the Redis Client.
 */
export default class RedisClient {
 /**
   * Creates an instance of the RedisClient.
   * Establishes a connection to the Redis server.
   */
 constructor() {
    /**
     * Creates a new instance of the Redis client.
     *
     * @type {Object}
     */
    this.client = createClient();
    this.client.connect();
    /**
     * Indicates the connection status to the Redis server.
     *
     * @type {boolean}
     */
    this.alive = true;

    /**
     * Sets up an error event listener for the Redis client.
     */
    this.client.on("error", (error) => {
      console.log(error);
      this.alive = false;
    });

    /**
     * Sets up a ready event listener for the Redis client.
     */
    this.client.once("ready", () => {
      this.alive = true;
      console.log("ready");
    });
 }

 /**
   * Checks if the Redis server connection is alive.
   *
   * @returns {boolean} - The status of the Redis server connection.
   */
 isAlive() {
    return this.alive;
 }

 /**
   * Retrieves the value associated with a key from Redis.
   *
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string | null>} - The value associated with the key or null if not found.
   */
 async get(key) {
    try {
      // Directly use the promise-based get method provided by the redis package
      return await this.client.get(key);
    } catch (error) {
      console.log(error);
    }
 }

 /**
   * Sets the value associated with a key in Redis.
   *
   * @param {string} key - The key to set.
   * @param {string} value - The value to associate with the key.
   * @param {number} duration - The expiration time for the key in seconds.
   * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
   */
 async set(key, value, duration) {
    try {
      await this.client.set(key, value, "EX", duration);
    } catch (error) {
      console.log(error);
    }
 }

 /**
   * Deletes a key and its associated value from Redis.
   *
   * @param {string} key - The key to delete.
   * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
   */
 async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.log(error);
    }
 }
}
