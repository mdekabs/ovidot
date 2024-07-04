import HttpStatus from 'http-status-codes';
import User from "../models/_user.js";
import { responseHandler } from '../utils/index.js';

const UserController = {
    /* get all users */
    get_users: async (req, res) => {
        try {
            const users = await User.find();
            responseHandler(res, HttpStatus.OK, "success", "", { users });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong please try again", { err });
        }
    },

    /* get single user */
    get_user: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }
            const { password, ...data } = user._doc;
            responseHandler(res, HttpStatus.OK, "success", "", { data });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong please try again", { err });
        }
    },

    /* get user stats */
    get_stats: async (req, res) => {
        const date = new Date();
        const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
        try {
            const data = await User.aggregate([
                { $match: { createdAt: { $gte: lastYear } } },
                { $project: { month: { $month: "$createdAt" } } },
                { $group: { _id: "$month", total: { $sum: 1 } } }
            ]);
            responseHandler(res, HttpStatus.OK, "success", "", { data });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong please try again", { err });
        }
    },

    /* update user */
    update_user: async (req, res) => {
        if (req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 10);
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            if (!updatedUser) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }
            responseHandler(res, HttpStatus.OK, "success", "User updated successfully", { updatedUser });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong please try again", { err });
        }
    },

    /* delete user */
    delete_user: async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }
            responseHandler(res, HttpStatus.OK, "success", "User has been deleted successfully");
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong please try again", { err });
        }
    }
};

export default UserController;
