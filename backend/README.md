# Ovidot API Service Backend
 This is a Menstrual Cycle Tracker built with Express.js that provides user management, menstrual cycle tracking, and authentication features. It enables users to sign up, log in, and securely track their menstrual cycles. Additionally, there are admin routes for managing users and cycles.

## Contributors
- [Eyang, Daniel Eyoh](https://github.com/Tediyang)
- [Ekabua Mawoda](https://github.com/mdekabs)

## Features
- **User Authentication:** Secure user authentication with token verification.
- **Admin Panel:** Admin routes for managing users, cycles, and other entities.
- **Password Reset:** Routes for handling forgotten passwords and resetting passwords securely.
- **User Management:** CRUD operations for managing user data.
- **Menstrual Cycle Tracking:** Allows users to track their menstrual cycles.

## Tech
* [Node Js](https://nodejs.org/en)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose](https://mongoosejs.com/)
* [Express Js](http://expressjs.com/)
* [Js Doc](https://github.com/jsdoc/jsdoc)

## Installation
1. Clone repository from github in your OS terminal
```bash
User@User ~
$ git clone https://github.com/Tediyang/ovidot.git
```

2. Change directory to the project directory
```bash
User@User ~ 
$ cd ovidot/backend
```

3. Change branch to master branch
```bash
User@User ~/ovidot/backend (master)
$ git switch master
```

4. Use the package manager [npm](https://docs.npmjs.com/cli/v9/commands/npm-install) to install all dependencies in package.json file
```bash
User@User ~/ovidot/backend (master)
$ npm install
```

5. Create a .env file in the project root directory. In the .env file create environment variables for master in this manner:
```bash
User@User ~/ovidot/backend 
$ vi .env
```

6. Then create the following environmental variables in the .env file with the appropriate values.
```bash
SECRETKEY=your-aplhanumeric-secret-key
ADMINKEY=your-alphanumeric-admin-key
HOST = 'your-local-host'
DB='your-mongo-db-url-connection'
EMAIL = "sender-email"
EMAILPASSWORD = "sender-email-address"
PORT = 'your-preferred-port'
ENVIR = 'test or production'
TESTDB = 'your-mongo-db-test-url'
ADMINKEY = 'your-admin-secret-key'
USERNAME = 'your-redis-username'
PASSWORD = 'your-redis-password'
REDISPORT = 'your-redis-port'
SECRETKEY = 'your-app-secret-key'
EMAIL = 'your-email-address-for-SMTP'
EMAILPASSWORD = 'your-email-password (this setup uses email-pass config)'
BLACKLIST = 'blacklist.json'
TEST_TOKEN = "user-test-token"
SUPERADMIN = 'superadmin username'
SUBADMIN = 'sub admin username'
ADMINPASS = "superadmin password"
SUPER_ADMIN_TOKEN = "super admin test token"
SUB_ADMIN_TOKEN = "subadmin test token"
TESTID = 'user test id'
```

7. To start the service
```bash
User@User ~/ovidot/backend
npm start
```

```bash
> backend@1.0.0 start
> nodemon app.js

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
Server is now running on port {specified port}
MongoDB connected!
```
##### N.B No Redis connection will pop up error. But on success, there won't be


To run test
```bash
User@User ~/ovidot/backend
npm test
```

## Usage
For local connection: http://127.0.0.1:{PORT}/{endpoint}

### UI Documentaion
UI docmentation: http://127.0.0.1:{PORT}/{endpoint}/api/v1/swagger/documentation

### Non-Authorization Endpoints
- Register a new user and get an access token for authentication purposes.
Request
```bash
```
POST /api/v1/signup
body:
```json
{
  "email": "<USER'S EMAIL>",
  "password": "<PASSWORD>",
  "username": "<USERNAME>",
  "age": "<AGE>",
  "period": "<PERIOD>"
}
```
Response (Status 201)


- Login with a registered account
Request
```bash
POST /api/v1/login
```
body:
```json
{
  "email": "<USER'S EMAIL>",
  "password": "<PASSWORD>"
}
```
Response on success (Status 200)
```json
{
  "message": "Authentication successful",
  "token": "token generated"
}
```
Response on failure (Status 401)
```json
{
  "message": "Authentication failed"
}
```

- Send forget password reset link
Request
```bash
POST /api/v1/forgot-password
```
body:
```json
{
  "email": "<EMAIL>",
  "url": "<URL TO REDIRECT THE PASS>"
}
```
Response (Status 201, Created): Password reset link sent to email
Response (Status 500): Password reset link sent to email | Internal Server Error

- Verify reset token
Request
```
GET /api/v1/reset-password/:token
```
Response (Status 200)
```json
{
  "message" : "success" ,
  "token": "<token>"
}
```

- Reset Password
Request
```
POST /api/v1/reset-password/:token
```
body:
```json
{
  "password": "<PASSWORD>",
}
```
Response (Status 200): "Password changed"

### Authorization Endpoints

- Logout a registered account
Request
```
GET /api/v1/auth/logout [Auth: Bearer Token]
```
Response (Status 200)


#### User Endpoint
- Get user data
Request
```
GET api/v1/auth/users/get [Auth: Bearer token]
```
Response (Status 200)
```json
{
  "userId": "<USER ID>",
  "email": "<USER EMAIL>",
  "username": "<USERNAME>",
  "age": "<AGE>",
  "period": "<PERIOD>"
}
```

- Update user data
Request
```
PUT api/v1/auth/users/update [Auth: Bearer token]
```
body:
```json
{
  "username": "<NEW USERNAME",
  "age": "<NEW AGE>"
}
```
Response (Status 200)
```json
{
  "userId": "<USER ID>",
  "email": "<USER EMAIL>",
  "username": "<NEW USERNAME>",
  "age": "<NEW AGE>",
  "period": "<NEW PERIOD>"
}
```
Response (Status 400)
```json
{
  "message": "Provide atleast a param to update: username, period or age"
}
```

- Delete user data
Request
```
DELETE api/v1/auth/users/delete [Auth: Bearer token]
```
Response (Status 204)

- Change Logged-in user password
Request
```
POST /api/v1/auth/users/change-password [Auth: Bearer Token]
```
body:
```json
{
  "currentPassword": "<OLD PASSWORD>",
  "newPassword": "<NEW PASSWORD>"
}
```
Response (Status 204)


#### Cycle Endpoint
- Create a Cycle
Request
```
POST api/v1/auth/cycles/create [Auth: Bearer Token]
```
```json
{
  "period": "<INT: NUMBER>",
  "startdate": "<DATE: CYCLE STARTDATE> | YYYY-MM-DD"
}
```
Response (status 201)
```json
{
  "message": "Cycle created",
  "cycleId": "<CYCLE ID>"
}
```

- Get a cycle by cycleId
Request
```
GET api/v1/auth/cycles/<:cycleId> [Auth: Bearer Token]
```
Response (Status 200)
```json
{
  "_id": "<CYCLE ID>",
  "month": "<MONTH>",
  "year": "<YEAR>",
  "period": "<NUM: PERIOD LENGTH>",
  "ovulation": "<DATE: OVULATION DAY>",
  "start_date": "<DATE: CYCLE START DATE>",
  "next_date": "<DATE: NEXT CYCLE START DATE>",
  "days": "<NUM: CYCLE DURATION DAYS>",
  "period_range": [
    "<DATE: MENSTRAUTION DAYS>",
  ],
  "ovulation_range": [
    "<DATE: DAYS WHICH OVULATION MAY FALL IN>",
  ],
  "unsafe_days": [
    "<DATE: UNSAFE DAYS>",
  ],
}
```

- Get all cycles for a given user with year as query parameter
Request
```
GET api/v1/auth/cycles/getall?year=year [Auth: Bearer Token]
```
Response (Status 200)
```json
[
  "{ <CYCLE DATA> }"
]
```

- Get all cycles by month with year as query parameter
Request
```
GET api/v1/auth/cycles/getall/<:month>?year=year [Auth: Bearer Token]
```
Response (Status 200)
```json
[
  "{ <CYCLE DATA> }"
]
```

- Update a cycle by cycleId
Request
```
PUT api/v1/auth/cycles/:cycleId [Auth: Bearer Token]
```
body:
```json
{
  "period": "<INT: NUMBER>",
  "ovulation": "<DATE: DATE OVULATION OCCURED> | YYYY-MM-DD"
}
```
Response (Status 200)
```json
{
  "_id": "<CYCLE ID>",
  "month": "<MONTH>",
  "year": "<YEAR>",
  "period": "<NUM: UPDATED PERIOD LENGTH>",
  "ovulation": "<DATE: UPDATED OVULATION DAY>",
  "start_date": "<DATE: CYCLE START DATE>",
  "next_date": "<DATE: UPDATED NEXT CYCLE START DATE>",
  "days": "<NUM: UPDATED CYCLE DURATION DAYS>",
  "period_range": [
    "<DATE: UPDATED MENSTRAUTION DAYS>",
  ],
  "ovulation_range": [
    "<DATE: UPDaTED DAYS WHICH OVULATION MAY FALL IN>",
  ],
  "unsafe_days": [
    "<DATE: UPDATED UNSAFE DAYS>",
  ],
}
```

- Delete cycle by cycleId
Request
```
DELETE api/v1/auth/cycles/<:cycleId> [Auth: Bearer Token]
```
Response (Status 204)
```
Cycle deleted
```


### Admin
- Login as admin
Request
```
POST /api/v1/admin/login
```
body:
```json
{
  "email": "<USERNAME>",
  "password": "<PASSWORD>"
}
```
Response on success (Status 200)
```json
{
  "message": "Authentication successful",
  "token": "token generated"
}
```

- Get all users with page and limit as parameter
Request
```
GET /api/v1/admin/users?page=page&limit=limit
```
Response (Status 200)
```json
[
  "{ <USER DATA> }"
]
```

- Get a user data
Request
```
POST /api/v1/admin/users/email
```
body:
```json
{
    "email": "<USER EMAIL>"
}
```
Response (Status 200)
```json
{
  "user": {
    "_id": "user's id",
    "email": "user email",
    "username": "username",
    "age": "<AGE>",
    "is_admin": false,
    "_cycles": [
      "cycle id"
    ],
    "created_at": "date created",
    "updated_at": "date updated"
  }
}
```

- Get cycles for a given user by email
```
POST /api/v1/admin/users/email/cycles?page=page&limit=limit
```
body:
```json
{
  "email": "user email"
}
```
Response (Status 200)
```json
[
  "{ <CYCLE DATA> }"
]
```

- Update a user's email
Request
```
PUT /api/v1/admin/users/email
```
body:
```json
{
  "oldEmail": "<OLD EMAIL",
  "newEmail": "<NEW EMAIl"
}
```
Response (Status 204)
```json
{
  "updated": "true || false"
}
```

- Delete User
Request
```
DELETE /api/v1/admin/users/email
```
Response (Status 204) : email deleted

- Create forgot password link for user
Request
```
POST api/v1/admin/users/forgot-password
```
body:
```json
{
  "email": "<EMAIL>"
}
```
Response (Status 201, Created): Password reset link sent to email
Response (Status 500): Password reset link sent to email | Internal Server Error

- Get cycles
Request
```
GET /api/v1/admin/cycles
```
Response (status 200)
```json
[
  "{ <CYCLE DATA> }"
]
```

- Fetch cycle
Request
```
GET api/v1/admin/cycles/:cycleId
```
Response (status 200)
```json
{
  "<CYCLE DATA>"
}
```

- Delete cycle
Request
```
GET api/v1/admin/cycles/:cycleId
```
Response (status 200): Cycle deleted
