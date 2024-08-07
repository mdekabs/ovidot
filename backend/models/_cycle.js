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
        type: String, // Change to String to handle encrypted data
        required: true
    },
    flowLength: {
        type: String, // Change to String to handle encrypted data
        required: true
    },
    predictedCycleLength: {
        type: String, // Change to String to handle encrypted data
        required: true
    },
    previousCycleLengths: {
        type: [String], // Change to array of Strings to handle encrypted data
        default: []
    },
    actualOvulationDate: {
        type: String // Change to String to handle encrypted data
    },
    ovulationDate: {
        type: String // Change to String to handle encrypted data
    },
    nextCycleStartDate: {
        type: String // Change to String to handle encrypted data
    },
    irregularCycle: {
        type: String, // Change to String to handle encrypted data
        default: false
    },
    month: {
        type: String,
        required: true
    }
});

// Encryption middleware
cycleSchema.pre('save', function(next) {
    this.startDate = encryptData(this.startDate, encryptionKey);
    this.flowLength = encryptData(this.flowLength, encryptionKey);
    this.predictedCycleLength = encryptData(this.predictedCycleLength, encryptionKey);
    this.previousCycleLengths = this.previousCycleLengths.map(length => encryptData(length, encryptionKey));
    if (this.actualOvulationDate) {
        this.actualOvulationDate = encryptData(this.actualOvulationDate, encryptionKey);
    }
    if (this.ovulationDate) {
        this.ovulationDate = encryptData(this.ovulationDate, encryptionKey);
    }
    if (this.nextCycleStartDate) {
        this.nextCycleStartDate = encryptData(this.nextCycleStartDate, encryptionKey);
    }
    this.irregularCycle = encryptData(this.irregularCycle.toString(), encryptionKey);
    this.month = encryptData(this.month, encryptionKey);
    next();
});

// Decryption middleware
cycleSchema.post('init', function(doc) {
    doc.startDate = decryptData(doc.startDate, encryptionKey);
    doc.flowLength = decryptData(doc.flowLength, encryptionKey);
    doc.predictedCycleLength = decryptData(doc.predictedCycleLength, encryptionKey);
    doc.previousCycleLengths = doc.previousCycleLengths.map(length => decryptData(length, encryptionKey));
    if (doc.actualOvulationDate) {
        doc.actualOvulationDate = decryptData(doc.actualOvulationDate, encryptionKey);
    }
    if (doc.ovulationDate) {
        doc.ovulationDate = decryptData(doc.ovulationDate, encryptionKey);
    }
    if (doc.nextCycleStartDate) {
        doc.nextCycleStartDate = decryptData(doc.nextCycleStartDate, encryptionKey);
    }
    doc.irregularCycle = decryptData(doc.irregularCycle, encryptionKey) === 'true';
    doc.month = decryptData(doc.month, encryptionKey);
});

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
