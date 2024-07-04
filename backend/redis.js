import { createClient } from "redis";

let instance = null;

/**
 * Class representing the Redis Client.
 */
class RedisClient {
  /**
   * Creates an instance of the RedisClient.
   * Establishes a connection to the Redis server.
   */
  constructor() {
    if (!instance) {
      instance = this;
      this.client = createClient();
      this.client.connect();
      this.alive = true;

      this.client.on("error", (error) => {
        console.log(error);
        this.alive = false;
      });

      this.client.once("ready", () => {
        this.alive = true;
        console.log("ready");
      });
    }

    return instance;
  }

  /**
   * Checks if the Redis server connection is alive.
   *
   * @returns {boolean} - The status of the Redis server connection.
   */
  isAlive = () => {
    return this.alive;
  };

  /**
   * Retrieves the value associated with a key from Redis.
   *
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string | null>} - The value associated with the key or null if not found.
   */
  get = async (key) => {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Sets the value associated with a key in Redis.
   *
   * @param {string} key - The key to set.
   * @param {string} value - The value to associate with the key.
   * @param {number} duration - The expiration time for the key in seconds.
   * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
   */
  set = async (key, value, duration) => {
    try {
      await this.client.set(key, value, "EX", duration);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Deletes a key and its associated value from Redis.
   *
   * @param {string} key - The key to delete.
   * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
   */
  del = async (key) => {
    try {
      await this.client.del(key);
    } catch (error) {
      console.log(error);
    }
  };
}

const redisClient = new RedisClient();
export default redisClient;
