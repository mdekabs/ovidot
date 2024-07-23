export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Ovidot: Each flow has a story! Women's health and wellness personalized!",
      version: "1.0.0",
      description: "API documentation",
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
        MoodEntry: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Mood Entry ID",
            },
            mood: {
              type: "string",
              description: "Mood category (e.g., happy, sad, anxious)",
            },
            symptoms: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Optional symptoms associated with the mood",
            },
            notes: {
              type: "string",
              description: "Optional notes related to the mood",
            },
            createdAt: {
              type: "string",
              description: "Date the mood entry was created",
              format: "date-time",
            },
          },
        },
        EmergencyContact: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Emergency Contact ID",
            },
            contactName: {
              type: "string",
              description: "Name of the emergency contact",
            },
            contactNumber: {
              type: "string",
              description: "Phone number of the emergency contact",
            },
            relationship: {
              type: "string",
              description: "Relationship with the user",
            },
          },
        },
        Pregnancy: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Pregnancy ID",
            },
            lastMenstruationDate: {
              type: "string",
              description: "The date of the last menstruation",
              format: "date",
            },
            createdAt: {
              type: "string",
              description: "Date the pregnancy was recorded",
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
