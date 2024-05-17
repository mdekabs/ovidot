import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  otpEnabled: { type: Boolean, default: false },
  otpSecret: String,
  passwordResetOTP: {
    code: String,
    expirationTimestamp: Date
  },
  passwordResetOTPExpiration: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  age: { type: Number, min: 8, max: 55 },
  period: { type: Number, min: 2, max: 8 },
  cycles: [{
    type: Schema.Types.ObjectId,
    ref: "Cycle"
  }]
});

userSchema.pre('save', function(next) {
  const currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

export default mongoose.model("User", userSchema);
