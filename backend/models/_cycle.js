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

cycleSchema.methods.encryptFields = function (encryptionKey) {
    if (this.startDate) this.startDate = encryptData(this.startDate.toISOString(), encryptionKey);
    if (this.flowLength !== undefined) this.flowLength = encryptData(this.flowLength.toString(), encryptionKey);
    if (this.predictedCycleLength !== undefined) this.predictedCycleLength = encryptData(this.predictedCycleLength.toString(), encryptionKey);
    if (this.previousCycleLengths) this.previousCycleLengths = this.previousCycleLengths.map(length => encryptData(length.toString(), encryptionKey));
    if (this.actualOvulationDate) this.actualOvulationDate = encryptData(this.actualOvulationDate.toISOString(), encryptionKey);
    if (this.ovulationDate) this.ovulationDate = encryptData(this.ovulationDate.toISOString(), encryptionKey);
    if (this.nextCycleStartDate) this.nextCycleStartDate = encryptData(this.nextCycleStartDate.toISOString(), encryptionKey);
    if (this.irregularCycle !== undefined) this.irregularCycle = encryptData(this.irregularCycle.toString(), encryptionKey);
    if (this.month) this.month = encryptData(this.month, encryptionKey);
};

cycleSchema.methods.decryptFields = function (encryptionKey) {
    if (this.startDate) this.startDate = new Date(decryptData(this.startDate, encryptionKey));
    if (this.flowLength) this.flowLength = parseInt(decryptData(this.flowLength, encryptionKey));
    if (this.predictedCycleLength) this.predictedCycleLength = parseInt(decryptData(this.predictedCycleLength, encryptionKey));
    if (this.previousCycleLengths) this.previousCycleLengths = this.previousCycleLengths.map(length => parseInt(decryptData(length, encryptionKey)));
    if (this.actualOvulationDate) this.actualOvulationDate = new Date(decryptData(this.actualOvulationDate, encryptionKey));
    if (this.ovulationDate) this.ovulationDate = new Date(decryptData(this.ovulationDate, encryptionKey));
    if (this.nextCycleStartDate) this.nextCycleStartDate = new Date(decryptData(this.nextCycleStartDate, encryptionKey));
    if (this.irregularCycle) this.irregularCycle = decryptData(this.irregularCycle, encryptionKey) === 'true';
    if (this.month) this.month = decryptData(this.month, encryptionKey);
};

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
