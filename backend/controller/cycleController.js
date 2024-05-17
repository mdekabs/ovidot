import DBClient from "../storage/db.js";
import CycleCalculator from "../util/cycleCalculator.js";
import CycleParser from "../util/cycleParser.js";

class CycleController {
  constructor() {
    this.dbClient = new DBClient();
  }

  async createCycle(request, response) {
    try {
      const { period, startDate, ovulation } = request.body;

      // Validation
      if (!period || !startDate) {
        return response.status(400).json({ error: "Missing required fields" });
      }

      // Get user ID from request
      const userId = request.user.id;

      // Calculate cycle data
      const cycleCalculator = new CycleCalculator(period, startDate, ovulation);
      const cycleData = cycleCalculator.calculateCycleData();

      // Parse cycle data
      const cycleParser = new CycleParser(cycleData);
      const parsedCycleData = cycleParser.parseCycle();

      // Create cycle
      const cycle = await this.dbClient.createCycle(userId, parsedCycleData);

      return response.status(201).json({ status: "Success", cycle });
    } catch (error) {
      console.error("Error creating cycle:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
