import "dotenv/config";
import Queue from 'bull';

const emailQueue = new Queue('emailQueue', {
    redis: process.env.REDIS_URL
});

console.log(`Redis URL: ${process.env.REDIS_URL}`);

export { emailQueue };
