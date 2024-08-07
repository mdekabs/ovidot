import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/index.js';

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

// Define the encryptFields method
cycleSchema.methods.encryptFields = function(encryptionKey) {
    this.startDate = encryptData(this.startDate.toISOString(), encryptionKey);
    this.flowLength = encryptData(this.flowLength.toString(), encryptionKey);
    this.predictedCycleLength = encryptData(this.predictedCycleLength.toString(), encryptionKey);
    this.previousCycleLengths = this.previousCycleLengths.map(length => encryptData(length.toString(), encryptionKey));
    if (this.actualOvulationDate) {
        this.actualOvulationDate = encryptData(this.actualOvulationDate.toISOString(), encryptionKey);
    }
    if (this.ovulationDate) {
        this.ovulationDate = encryptData(this.ovulationDate.toISOString(), encryptionKey);
    }
    if (this.nextCycleStartDate) {
        this.nextCycleStartDate = encryptData(this.nextCycleStartDate.toISOString(), encryptionKey);
    }
    this.irregularCycle = encryptData(this.irregularCycle.toString(), encryptionKey);
    this.month = encryptData(this.month, encryptionKey);
};

// Decryption middleware
cycleSchema.post('init', function(doc) {
    doc.startDate = new Date(decryptData(doc.startDate, doc.encryptionKey));
    doc.flowLength = parseInt(decryptData(doc.flowLength, doc.encryptionKey));
    doc.predictedCycleLength = parseInt(decryptData(doc.predictedCycleLength, doc.encryptionKey));
    doc.previousCycleLengths = doc.previousCycleLengths.map(length => parseInt(decryptData(length, doc.encryptionKey)));
    if (doc.actualOvulationDate) {
        doc.actualOvulationDate = new Date(decryptData(doc.actualOvulationDate, doc.encryptionKey));
    }
    if (doc.ovulationDate) {
        doc.ovulationDate = new Date(decryptData(doc.ovulationDate, doc.encryptionKey));
    }
    if (doc.nextCycleStartDate) {
        doc.nextCycleStartDate = new Date(decryptData(doc.nextCycleStartDate, doc.encryptionKey));
    }
    doc.irregularCycle = decryptData(doc.irregularCycle, doc.encryptionKey) === 'true';
    doc.month = decryptData(doc.month, doc.encryptionKey);
});

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
