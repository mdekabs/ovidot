import { emailQueue, _emailProcessor } from './utils/index.js';
import dotenv from "dotenv";

emailQueue.process(_emailProcessor);

console.log('Email worker is running and processing jobs...');
