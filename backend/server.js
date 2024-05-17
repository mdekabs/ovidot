import express from "express";
import bodyParser from "body-parser";
import router from "./route/index.js";
import { logger, appLogger } from "./middleware/logger.js";
import cors from "cors";
import DBClient from "./storage/db.js";
import RedisClient from "./storage/redis.js";

const app = express();
const port = process.env.PORT || 5000;
const dbClientInstance = new DBClient();
const redisClient = new RedisClient();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(appLogger);

app.get("/", (request, response) => {
  response.send("Welcome to the API");
});

async function startServer() {
  try {
    await dbClientInstance.connect();
    console.info("Database is connected");

    while (!redisClient.isAlive()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.info("Redis is connected");
    app.listen(port, () => {
      console.info(`Server is live on port ${port}!! Stay locked in!!`);
    });
  } catch (error) {
    console.error("Failed to connect to db", error);
  }
}

startServer();
