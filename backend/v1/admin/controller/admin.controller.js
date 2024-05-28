import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import Admin from '../model/admin.model.js';
import Cycle from '../../models/cycle.model.js';
import User from '../../models/user.model.js';
import { handleResponse } from '../../utility/handle.response.js';
import { validationResult } from 'express-validator';
import { populateWithCycles } from '../../utility/user.populate.js';
import { cycleFilter } from '../../utility/cycle.parsers.js';
import paginationMiddleware from "../middleware/paginationMiddleware.js";


const { compare } = bcryptjs;
const { sign } = jsonwebtoken;
const secretKey = process.env.ADMINKEY;

/**
 * Generate token
 * @param {Admin} admin - Admin Object to generate token for. 
 */
function createToken(admin) {
  return sign({ id: admin._id, admin: admin.is_admin }, secretKey, { expiresIn: '1h' });
}

/**
 * Admin Controller
 * @module AdminController
 */
const adminController = {
  /**
   * @async Login an admin user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  login: async (req, res) => {
    const { username, password } = req.body;

    // validate params
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, "Fill required properties");
    }

    const admin = await Admin.findOne({ username: username });

    if (!admin) {
      return handleResponse(res, 404, `${username} doesn't exist`);
    }

    const matched = await compare(password, admin.password);
    try {
      if (matched) {
        const token = createToken(admin);
        res.status(200).json({
          message: 'Authentication successful',
          token
        });
      } else {
        return handleResponse(res, 401, 'Authentication failed');
      }
    } catch (error) {
      return handleResponse(res, 500, 'Internal Server Error', error);
    }
  },

  /**
   * @async Get all users.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  viewAllusers: async (req, res) => {
    try {
      const { page, limit, links } = res.locals.pagination;

      const allUsers = await User.find({}, '-password -reset -resetExp -__v')
      .skip((page - 1) * limit)
      .limit(limit);
      return res.status(200).json({ allUsers, links });
    } catch (error) {
      handleResponse(res, 500, "Internal Server Error", error);
    }
  },


  /**
   * Return all the cycle for a given user.
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns 
   */
  getAllCyclesByEmail: async (req, res) => {
    try {
      // validate params
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return handleResponse(res, 400, "Fill required properties");
      }
      const { page, limit, links } = res.locals.pagination;

      // Exclude these variables '-password -reset -resetExp -__v' in the result.
      const user = await User.findOne({ email: req.body.email }, '-password -reset -resetExp -__v');
      if (!user) {
        return handleResponse(res, 404, `User with ${req.body.email} not found`);
      }

      const populate_user = await populateWithCycles(user.id);
  
      const allCycles = populate_user._cycles
      .slice((page - 1) * limit, page * limit)
      .map(cycleFilter);

      return res.status(200).json({ allCycles, links });
    } catch (error) {
      handleResponse(res, 500, "Internal Server Error", error);
    }
  },

  /**
   * @async  Get a given user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  viewUser: async (req, res) => {
    try {
      // validate params
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return handleResponse(res, 400, "Fill required properties");
      }

      // Exclude these variables '-password -reset -resetExp -__v' in the result.
      const user = await User.findOne({ email: req.body.email }, '-password -reset -resetExp -__v');
      if (!user) {
        return handleResponse(res, 404, `User with ${req.body.email} not found`);
      }
      return res.status(200).json({ user });
    } catch (error) {
      handleResponse(res, 500, "Internal Server Error", error);
    }
  },

  /**
   * @async Update a user email.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  updateUser: async (req, res) => {
    try {
      if (!req.user.admin) {
        return handleResponse(res, 403, 'Forbidden');
      }

      // validate the params
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return handleResponse(res, 400, "Fill required properties");
      }

      // Exclude these variables '-password -reset -resetExp -__v' in the result.
      const user = await User.findOne({ email: req.body.oldEmail }, '-password -reset -resetExp -__v');
      if (!user) {
        return handleResponse(res, 404, `User with ${req.body.oldEmail} not found`);
      }
      const updateUser = await User.findByIdAndUpdate(user.id,
        { email: req.body.newEmail },
        { new: true });

      const updated = updateUser.email === req.body.newEmail;
      return res.status(200).json({ updated: updated });
    } catch (error) {
      return handleResponse(res, 500, 'Internal Server Error', error);
    }
  },

  /**
   * @async Delete a given user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  deleteUser: async (req, res) => {
    try {
      if (!req.user.admin) {
        return handleResponse(res, 403, 'Forbidden');
      }

      // validate params
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return handleResponse(res, 400, "Fill required properties");
      }

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return handleResponse(res, 404, `${req.body.email} not found`);
      }
      const delUser = await User.findByIdAndDelete(user.id);
      if (!delUser) {
        return handleResponse(res, 404, "User not found");
      }

      return res.status(204).send(`${req.body.email} deleted`);
    } catch (error) {
      return handleResponse(res, 500, 'Internal Server Error', error);
    }
  },

  /**
   * @async  View all cycles.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  viewAllCycles: async (req, res) => {
    try {

      const allCycleData = await Cycle.find({});

      return res.status(200).json({ allCycleData });
    } catch (error) {
      handleResponse(res, 500, "Internal Server Error", error);
    }
  },

  /**
   * @async Fetch a cycle by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  viewCycle: async (req, res) => {
    try {
      const cycleId = req.params.cycleId;

      // Retrieve specific cycle data by ID
      const specificCycleData = await Cycle.findById(cycleId);
      if (!specificCycleData) {
        return handleResponse(res, 404, "Cycle data not found");
      }

      return res.status(200).json({ specificCycleData });
    } catch (error) {
      handleResponse(res, 500, "Internal server error", error);
    }
  },

  /**
   * @async Delete cycle data.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws {Object} - Error response object.
   */
  deleteCycle: async (req, res) => {
    try {
      if (!req.user.admin) {
        return handleResponse(res, 403, 'Forbidden');
      }

      const cycleIdToDelete = req.params.cycleId;

      // Find and delete specific cycle data by ID
      const deletedCycleData = await Cycle.findByIdAndDelete(cycleIdToDelete);
      if (!deletedCycleData) {
        return handleResponse(res, 404, "Data not found");
      }

      res.status(204).send('Cycle data deleted successfully');
    } catch (error) {
      handleResponse(res, 500, "Internal server error", error);
    }
  },
};

export default adminController;
