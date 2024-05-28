
// Import dependencies
import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import verify from './v1/middleware/tokenVerification.js';
import { logger, appLogger } from './v1/middleware/logger.js';
import { createClient } from 'redis';
import { readFileSync } from 'fs';
import useragent from 'express-useragent';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

dotenv.config();

// Import routes
import generalRoutes from './v1/routes/general.routes.js';
import authRoutes from './v1/routes/auth.routes.js';
import adminRoutes from './v1/admin/route/admin.routes.js';

const { connect, connection } = mongoose;
const { urlencoded } = bodyParser;

// Start app
const app = express();

// Get environment variables
const { HOST, ENVIR, PORT, USERNAME, PASSWORD, REDISPORT, PRIKEY, CRT, PEMFILE } = process.env;
const url = ENVIR !== 'test' ? process.env.DB : process.env.TESTDB;

// URL path
const APP_PATH = '/api/v1';

// Swagger JSDoc configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ovidot Backend API',
      version: '1.0.0',
      description: 'Ovidot Backend API Documentation',
    },
    components: {
      securitySchemes: {
        adminToken: { // This name must match the name used in the security section of your path
          type: 'http', // The type of the security scheme
          scheme: 'bearer', // The name of the HTTP Authorization scheme to be used
          bearerFormat: 'JWT', // Optional, only needed if using bearer tokens
        },
        userToken: { // This name must match the name used in the security section of your path
          type: 'http', // The type of the security scheme
          scheme: 'bearer', // The name of the HTTP Authorization scheme to be used
          bearerFormat: 'JWT', // Optional, only needed if using bearer tokens
        },
      },
    },
    servers: [
      {
        url: `http://${HOST}:${PORT}${APP_PATH}/admin`,
        description: 'Admin Routes Server',
      },
      {
        url: `http://${HOST}:${PORT}${APP_PATH}/auth`,
        description: 'Authenticated Routes server',
      },
      {
        url: `http://${HOST}:${PORT}${APP_PATH}`,
        description: 'General Routes server',
      },
    ],
  },
  apis: ['./v1/routes/*.js', "./v1/routes/auth/*.js", "./v1/admin/route/*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Connect to MongoDB database
connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 2,
});

const db = connection;

db.on('error', error => {
  logger.error('MongoDB connection error:', error);
});
db.once('open', () => {
  logger.info('MongoDB connected!');
});

// Connect to Redis database
export let redisClient;

if (ENVIR !== 'test') {
  redisClient = await createClient({
    username: `${USERNAME}`,
    password: `${PASSWORD}`,
    socket: {
      host: HOST,
      port: REDISPORT,
      tls: true,
      key: readFileSync(`./${PRIKEY}`),
      cert: readFileSync(`./${CRT}`),
      ca: [readFileSync(`./${PEMFILE}`)],
      reconnectStrategy: retries => {
        if (retries > 10) return new Error('Max reconnection attempts exceeded');
        return Math.min(retries * 50, 2000);
      },
    },
  })
    .on('error', err => logger.error('Redis Client Error', err))
    .connect();
} else {
  redisClient = await createClient({
    socket: {
      reconnectStrategy: retries => {
        if (retries > 10) return new Error('Max reconnection attempts exceeded');
        return Math.min(retries * 50, 2000);
      },
    },
  })
    .on('error', err => logger.error('Redis Client Error', err))
    .connect();
}

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(express.json());

// Agent library
app.use(useragent.express());

// Use loggers
app.use(appLogger);

// Use Swagger UI
app.use(APP_PATH + '/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Use routes
app.use(APP_PATH + '/auth', verify, authRoutes);
app.use(APP_PATH + '/admin', adminRoutes);
app.use(APP_PATH, generalRoutes);

app.listen(PORT, () => {
  logger.info(`Server is now running on port ${PORT}`);
});

export default app;
