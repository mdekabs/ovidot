// Import dependencies
import dotenv from 'dotenv';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
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

// Start app
const app = express();

// Get environment variables
const { HOST, ENVIR, PORT, USERNAME, PASSWORD, REDISPORT, PRIKEY, CRT, PEMFILE, DB, TESTDB } = process.env;
//const url = ENVIR !== 'test' ? DB : TESTDB;
const url = process.env.DB;

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
        adminToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        userToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
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
}).catch(error => {
  logger.error('MongoDB connection error:', error);
  process.exit(1); // Exit process with failure
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

async function connectRedis() {
  try {
    if (ENVIR !== 'test') {
      redisClient = createClient({
        username: USERNAME,
        password: PASSWORD,
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
      });
    } else {
      redisClient = createClient({
        socket: {
          reconnectStrategy: retries => {
            if (retries > 10) return new Error('Max reconnection attempts exceeded');
            return Math.min(retries * 50, 2000);
          },
        },
      });
    }
    redisClient.on('error', err => logger.error('Redis Client Error', err));
    await redisClient.connect();
  } catch (err) {
    logger.error('Failed to connect to Redis', err);
  }
}

connectRedis();

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());
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

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Exit process with failure
});

export default app;
