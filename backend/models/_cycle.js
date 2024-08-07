import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/index.js';
import dotenv from "dotenv";

dotenv.config();

const encryptionKey = process.env.ENCRYPTION_KEY;

const cycleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    flowLength: {
        type: Number,
        required: true
    },
    predictedCycleLength: {
        type: Number,
        required: true
    },
    previousCycleLengths: {
        type: [Number],
        default: []
    },
    actualOvulationDate: {
        type: Date
    },
    ovulationDate: {
        type: Date
    },
    nextCycleStartDate: {
        type: Date
    },
    irregularCycle: {
        type: Boolean,
        default: false
    },
    month: {
        type: String,
        required: true
    }
});

// Encryption middleware
cycleSchema.pre('save', function(next) {
    if (this.isModified('startDate')) {
        this.startDate = encryptData(this.startDate.toISOString(), encryptionKey);
    }
    if (this.isModified('flowLength')) {
        this.flowLength = encryptData(this.flowLength.toString(), encryptionKey);
    }
    if (this.isModified('predictedCycleLength')) {
        this.predictedCycleLength = encryptData(this.predictedCycleLength.toString(), encryptionKey);
    }
    if (this.isModified('previousCycleLengths')) {
        this.previousCycleLengths = this.previousCycleLengths.map(length => encryptData(length.toString(), encryptionKey));
    }
    if (this.isModified('actualOvulationDate')) {
        this.actualOvulationDate = encryptData(this.actualOvulationDate.toISOString(), encryptionKey);
    }
    if (this.isModified('ovulationDate')) {
        this.ovulationDate = encryptData(this.ovulationDate.toISOString(), encryptionKey);
    }
    if (this.isModified('nextCycleStartDate')) {
        this.nextCycleStartDate = encryptData(this.nextCycleStartDate.toISOString(), encryptionKey);
    }
    if (this.isModified('irregularCycle')) {
        this.irregularCycle = encryptData(this.irregularCycle.toString(), encryptionKey);
    }
    if (this.isModified('month')) {
        this.month = encryptData(this.month, encryptionKey);
    }
    next();
});

// Decryption middleware
cycleSchema.post('init', function(doc) {
    doc.startDate = new Date(decryptData(doc.startDate, encryptionKey));
    doc.flowLength = parseInt(decryptData(doc.flowLength, encryptionKey), 10);
    doc.predictedCycleLength = parseInt(decryptData(doc.predictedCycleLength, encryptionKey), 10);
    doc.previousCycleLengths = doc.previousCycleLengths.map(length => parseInt(decryptData(length, encryptionKey), 10));
    if (doc.actualOvulationDate) {
        doc.actualOvulationDate = new Date(decryptData(doc.actualOvulationDate, encryptionKey));
    }
    if (doc.ovulationDate) {
        doc.ovulationDate = new Date(decryptData(doc.ovulationDate, encryptionKey));
    }
    if (doc.nextCycleStartDate) {
        doc.nextCycleStartDate = new Date(decryptData(doc.nextCycleStartDate, encryptionKey));
    }
    doc.irregularCycle = decryptData(doc.irregularCycle, encryptionKey) === 'true';
    doc.month = decryptData(doc.month, encryptionKey);
});

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
