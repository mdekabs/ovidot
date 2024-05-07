import mongoose from "mongoose";
import User from "../model/user.js";
import Cycle from "../model/cycle.js";
import { config } from "dotenv";


config();


class DBClient {


  constructor() {
    this.URI = process.env.DB_URI;
    this.UserModel = User;
    this.CycleModel = Cycle;

    async connect() {
      try {
        await mongoose.connect(this.URI, {});
        console.log("DB connection successful");
      }
      catch (error) {
        console.error("DB connection error:", error);
      }
    }

    async disconnect() {
      try {
        await mongoose.disconnect();
        console.log("DB disconnection successful");
      }
      catch (error) {
        cosole.error("DB connection error:", error);
      }

      async createUser(userData) {
        try {
          const user = new this.UserModel(userData);
          await user.save();
          console.info("User created successfully!");
          return user._id;
        }
        catch (error) {
          console.error("Encountered error  while creating user:", error);
          throw error;
        }
      }


      async createCycle(userId, cycleData) {
        try {
          const cycle = new Cycle({...cycleData, user: userId });
          await cycle.save();
          return cycle;
        }
        catch (error) {
          console.error("Error creating cycle:", error);
          throw error;
        }
      }


      async fetchUserByEmail(email) {
        try {
          const user = await this.UserModel.findOne({ email });
          return user;
        }
        catch (error) {
          console.error("Encountered error while trying to fetch user by email:", error);
          throw error;
        }
      }

      async fetchUserById(userId) {
        try {
          const user = await this.UserModel.findById(userId);
          return user:
        }
        catch (error) {
          console.error("Error while fetching user by Id:", error);
          throw error;
        }
      }


      async updateUser(userId, userData) {
        try {
          const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });
          return updatedUser;
        }
        catch (error) {
          console.error("Error updating user:", error);
          throw error;
        }
      }

      async deleteuser(userId) {
        try {
          const deletedUser = await User.findByIdAndDelete(userId);
          return deletedUser;
        }
        catch (error) {
          console.error("Error deleting user:", error);









