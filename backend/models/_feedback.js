import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cycle',
        required: true
    },
    accuracy: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comments: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
