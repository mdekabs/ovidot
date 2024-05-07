import DBClient from "../storage/db.js";
import NotificationService from "../util/notification.js";
import bcrypt from "bcrypt";

/**
 * Controller handling user-related endpoints.
 */
class UserController {
  /**
   * Creates an instance of UserController.
   */
  constructor() {
    this.dbClient = new DBClient();
    this.notificationService = new NotificationService();
  }

  /**
   * Creates a new user.
   * 
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async postNew(request, response) {
    const { email, password, username } = request.body;

    if (!email ||username ||password) {
      return response.status(400).json({ error: "Missing required fields" }).end();
    }

    try {
      const existingUser = await this.dbClient.fetchUserByEmail(email);
      if (existingUser) {
        return response.status(400).json({ error: "User already exists" }).end();
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userID = await this.dbClient.createUser({
        email,
        username,
        password: hashedPassword
      });

      await this.notificationService.sendWelcomeNotification(email, username);

      return response.status(201).json({ status: "Success", id: userID, email, username }).end();
    } catch (error) {
      console.error("Error creating user:", error);
      return response.status(500).json({ error: "Internal Server Error" }).end();
    }
  }

  /**
   * Fetches a user by their ID.
   * 
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async fetchUser(request, response) {
    const { userId } = request.body;

    if (!userId) {
      return response.status(400).json({ error: "Missing user ID" }).end();
    }

    try {
      const user = await this.dbClient.fetchUserById(userId);
      if (!user) {
        return response.status(404).json({ error: "User not found" }).end();
      }

      return response.status(200).json({ status: "Success", user }).end();
    } catch (error) {
      console.error("Error fetching user:", error);
      return response.status(500).json({ error: "Internal Server Error" }).end();
    }
  }

  /**
   * Updates a user by their ID and sends a notification upon successful update.
   * 
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async updateUser(request, response) {
    const { email, username, password } = request.body;

    // Assuming `request.user` contains the authenticated user's information
    const userId = request.user.id;

    if (!userId) {
      return response.status(400).json({ error: "User ID not available" }).end();
    }

    try {
      const existingUser = await this.dbClient.fetchUserById(userId);
      if (!existingUser) {
        return response.status(404).json({ error: "User not found" }).end();
      }

      const updatedUser = await this.dbClient.updateUser(userId, { email, username, password });

      await this.notificationService.sendUpdateNotification(userId);

      return response.status(200).json({ status: "Success", user: updatedUser }).end();
    } catch (error) {
      console.error("Error updating user:", error);
      return response.status(500).json({ error: "Internal Server Error" }).end();
    }
  }

  /**
   * Deletes a user by their ID and sends a notification upon successful deletion.
   * 
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   */
  async deleteUser(request, response) {
    // Assuming `request.user` contains the authenticated user's information
    const userId = request.user.id;

    if (!userId) {
      return response.status(400).json({ error: "User ID not available" }).end();
    }

    try {
      const deletedUser = await this.dbClient.deleteUser(userId);
      if (!deletedUser) {
        return response.status(404).json({ error: "User not found" }).end();
      }

      await this.notificationService.sendDeletionConfirmationNotification(userId);

      return response.status(200).json({ status: "Success", message: "User deleted successfully" }).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      return response.status(500).json({ error: "Internal Server Error" }).end();
    }
  }
