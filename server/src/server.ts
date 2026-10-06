import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express only after database connection succeeds
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Server startup error: ${error.message}`);
    } else {
      console.error("Unknown server startup error");
    }

    process.exit(1);
  }
};

void startServer();