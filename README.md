![Ovidot](https://res.cloudinary.com/dxd3nmbag/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1721142015/period_length_ntr5qg.jpg)
Welcome to **Ovidot**, the comprehensive cycle management service designed to simplify and enhance menstrual health tracking. Ovidot leverages advanced algorithms to predict ovulation dates, identify cycle irregularities, and provide valuable insights for users. In addition to cycle management, Ovidot offers robust features for managing emergency contacts, recording mood entries, and tracking pregnancies. Our service is built with a robust backend, ensuring secure and efficient data management for all users.

## Features

- **Cycle Prediction**: Predict ovulation dates and cycle lengths based on user data.
- **Cycle Update**: Update cycle details, including actual ovulation date and flow length.
- **User Management**: Admin capabilities to manage users and retrieve statistics.
- **Authentication**: Secure registration, login, and password management.
- **Redis Caching**: Improve performance with Redis caching for frequently accessed data.
- **Emergency Contacts Management: Manage emergency contacts for users.
- **Mood Entries Management: Record and retrieve mood entries for users.
- **Pregnancy Management: Record, retrieve, and delete pregnancies for users.


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
    cd ovidot/backend
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
    nodemon app.js work.js
    ```
