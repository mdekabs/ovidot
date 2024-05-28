
// Import necessary modules
import { Router } from 'express';
import userRoutes from './auth/user.routes.js';
import cycleRoutes from './auth/cycle.routes.js';
import { logout } from '../controllers/register.controller.js';

// Create an Express router
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Logout Route | Authentication Needed
 *   description: Endpoints requiring authentication
 */

router.use('/users', userRoutes);
router.use('/cycles', cycleRoutes);

// Route to log out a user
/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out a user
 *     tags: [Logout Route | Authentication Needed]
 *     security:
 *       - userToken: []
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '401':
 *         description: Unauthorized request
 */
router.get('/logout', logout);

// Export the router
export default router;
