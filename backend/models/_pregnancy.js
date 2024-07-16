import mongoose from "mongoose";

const PregnancySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lastOvulationDate: {
        type: Date,
        required: true
    },
    edd: {
        type: Date,
        required: true
    },
    recordedAt: {
        type: Date,
        default: Date.now
    },
    manualInput: {
        type: Boolean,
        default: false
  }
});

const Pregnancy = mongoose.model("Pregnancy", PregnancySchema);

export default Pregnancy;
