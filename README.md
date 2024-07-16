# Ovidot
## Figma Prototype

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FFCKjvh1jZpkxOU8vSAAuwO%2Fovidot%3Fnode-id%3D192-1595%26t%3DmalJCdxF6cTN1GtJ-1%26scaling%3Dmin-zoom%26content-scaling%3Dfixed%26page-id%3D0%253A1%26starting-point-node-id%3D192%253A1521" allowfullscreen></iframe>
# Overview

Welcome to **Ovidot**, the comprehensive cycle management service designed to simplify and enhance menstrual health tracking. Ovidot leverages advanced algorithms to predict ovulation dates, identify cycle irregularities, and provide valuable insights for users. Our service is built with a robust backend, ensuring secure and efficient data management for all users.

## Features

- **Cycle Prediction**: Predict ovulation dates and cycle lengths based on user data.
- **Cycle Update**: Update cycle details, including actual ovulation date and flow length.
- **User Management**: Admin capabilities to manage users and retrieve statistics.
- **Authentication**: Secure registration, login, and password management.
- **Redis Caching**: Improve performance with Redis caching for frequently accessed data.

## Technologies Used

- **Node.js**: Backend development
- **Express**: API framework
- **MongoDB**: Database
- **Redis**: Caching
- **Joi**: Input validation
- **Swagger**: API documentation
- **JWT**: Authentication

## API Documentation & Usage

Explore the full API documentation via Swagger: http:localhost:${port}/api-docs

## Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/yourusername/ovidot.git
    cd ovidot
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following:

    ```sh
    DB_URI
    SMTP_HOST
    SMTP_PORT
    SMTP_SERVICE
    SMTP_MAIL
    SMTP_PASSWORD
    PORT
    JWT_SECRET
    REDIS_URL
    ```

4. **Start the server:**

    ```sh
    npm start
    ```
