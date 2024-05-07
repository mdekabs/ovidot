import { Schema, model } from 'mongoose';

// Setup the calender model
const CycleSchema = Schema({
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    period: {
        type: Number,
        required: true,
        min: 1
    },
    ovulation: {
        type: Date,
    },
    start_date: {
        type: Date,
        required: true
    },
    next_date: {
        type: Date,
        required: true
    },
    days: {
	    type: Number,
	    required: true,
        min: 1
    },
    period_range: [
        {
            type: Date,
            required: true
        }
    ],
    ovulation_range: [
        {
            type: Date,
            required: true,
        }
    ],
    unsafe_days: [
        {
            type: Date,
            required: true
        }
    ]
});

const Cycle = model('Cycle', CycleSchema);
export default Cycle;
