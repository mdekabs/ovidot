export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Ovidot: Women Cycle Tracking API",
      version: "1.0.0",
      description: "Cycle Tracking API documentation",
    },
    servers: [
      {
        url: "https://ovidot.onrender.com/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        accessToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            username: {
              type: "string",
              description: "Username",
            },
            email: {
              type: "string",
              description: "User email",
            },
            password: {
              type: "string",
              description: "User password",
            },
            isAdmin: {
              type: "boolean",
              description: "Is the user an admin",
            },
          },
        },
        Cycle: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Cycle ID",
            },
            startDate: {
              type: "string",
              description: "Start date of the cycle",
              format: "date-time",
            },
            flowLength: {
              type: "number",
              description: "Length of menstrual flow",
            },
            predictedCycleLength: {
              type: "number",
              description: "Predicted length of the cycle",
            },
            previousCycleLengths: {
              type: "array",
              items: {
                type: "number",
              },
              description: "Array of previous cycle lengths",
            },
            irregularCycle: {
              type: "boolean",
              description: "Flag indicating if the cycle is irregular",
            },
            actualOvulationDate: {
              type: "string",
              description: "Actual ovulation date",
              format: "date-time",
            },
            nextCycleStartDate: {
              type: "string",
              description: "Start date of the next cycle",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        accessToken: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};
