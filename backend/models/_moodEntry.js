import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    mood: {
        type: String,
        required: true
    },
    symptoms: {
        type: [String],
        required: false
    },
    notes: {
        type: String,
        required: false
    }
});

const MoodEntry = mongoose.model("MoodEntry", moodEntrySchema);
export default MoodEntry;
