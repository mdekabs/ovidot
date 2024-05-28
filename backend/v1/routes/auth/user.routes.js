
// Import necessary modules
import { Router } from 'express';
import * as user from '../../controllers/user.controller.js';
import { changePass } from '../../controllers/password.controller.js';
import { body } from 'express-validator';

// Create an Express router
const router /** @type {ExpressRouter} */ = Router();

/**
 * @swagger
 * tags:
 *   name: User Routes | Authentication Needed
 *   description: Endpoints related to user operations
 */

// Route to get user data
/**
 * @swagger
 * /users/get:
 *   get:
 *     summary: Get user data
 *     tags: [User Routes | Authentication Needed]
 *     security:
 *       - userToken: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user data
 *       '401':
 *         description: Unauthorized request
 */
router.get('/get', user.fetchUser);

// Route to update user data
/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update user data
 *     tags: [User Routes | Authentication Needed]
 *     security:
 *       - userToken: []
 *     responses:
 *       '200':
 *         description: User data updated successfully
 *       '401':
 *         description: Unauthorized request
 *       '400':
 *         description: Bad request
 */
router.put('/update',[
    body("username").optional({ checkFalsy: true }).isAlpha(),
    body("age").optional({ checkFalsy: true }).isInt({ min: 8, max: 55 }),
    body("period").optional({ checkFalsy: true }).isInt({ min: 2, max: 8 })
    ],
    user.updateUser);

// Route to delete user by UserId
/**
 * @swagger
 * /users/delete:
 *   delete:
 *     summary: Delete user by UserId
 *     tags: [User Routes | Authentication Needed]
 *     security:
 *       - userToken: []
 *     responses:
 *       '204':
 *         description: User deleted successfully
 *       '401':
 *         description: Unauthorized request
 *       '400':
 *         description: Bad request
 */
router.delete('/delete', user.deleteUser);

// Route to change the logged-in user's password
/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change logged-in user password
 *     tags: [User Routes | Authentication Needed]
 *     security:
 *       - userToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '401':
 *         description: Unauthorized request
 *       '400':
 *         description: Bad request
 */
router.put('/change-password', [
    body("currentPassword").isString().notEmpty(),
    body("newPassword").isString().notEmpty(),
    ],
    changePass
);

// Export the router
export default router;
