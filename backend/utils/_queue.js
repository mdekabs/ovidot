import "dotenv/config";
import Queue from 'bull';


//dotenv.config();


const RH = process.env.REDIS_HOST;
const RP = process.env.REDIS_PORT;
console.log(RH);

const emailQueue = new Queue('emailQueue', {
    redis: {
        host: process.env.RH,
        port: process.env.RP
    }
});

export { emailQueue };
