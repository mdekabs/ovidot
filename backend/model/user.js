import mongoose from "mongoose";

/**
 * Mongoose schema for the User model.
 */
const userSchema = new mongoose.Schema({
  /**
   * The username of the user.
   * @type {string}
   * @required
   */
  username: { type: String, required: true },

  /**
   * The email address of the user.
   * @type {string}
   * @required
   * @unique
   */
  email: { type: String, required: true, unique: true },

  /**
   * The password of the user.
   * @type {string}
   */
  password: { type: String, required: false },

  /**
   * Flag indicating whether OTP (One-Time Password) authentication is enabled for the user.
   * @type {boolean}
   * @default false
   */
  otpEnabled: { type: Boolean, default: false },

  /**
   * The secret key for OTP generation and verification.
   * @type {string}
   */
  otpSecret: String,

  /**
   * Object representing the password reset OTP (One-Time Password) details.
   * @type {object}
   */
  passwordResetOTP: {
    /**
     * The OTP code for password reset.
     * @type {string}
     */
    code: String,

    /**
     * The expiration timestamp of the password reset OTP.
     * @type {Date}
     */
    expirationTimestamp: Date
  },

  /**
   * The expiration timestamp of the password reset OTP.
   * @type {Date}
   */
  passwordResetOTPExpiration: Date,

  /**
   * The creation timestamp of the user.
   * @type {Date}
   * @default Date.now
   */
  created_at: { type: Date, default: Date.now },

  /**
   * The last update timestamp of the user.
   * @type {Date}
   * @default Date.now
   */
  updated_at: { type: Date, default: Date.now },

  /**
   * The age of the user.
   * @type {number}
   * @min 8
   * @max 55
   */
  age: { type: Number, min: 8, max: 55 },

  /**
   * The period of the user.
   * @type {number}
   * @min 2
   * @max 8
   */
  period: { type: Number, min: 2, max: 8 }
},

  cycles: [{
    type: Schema.Types.ObjectId,
    ref: "Cycle"
  }]
});

// Update timestamps middleware
userSchema.pre('save', function(next) {
  const currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

/**
 * Mongoose model for the User schema.
 */
export default mongoose.model("User", userSchema);
