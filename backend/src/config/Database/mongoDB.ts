import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURL = process.env.MONGO_URL;

    if (!mongoURL) {
      throw new Error("Mongo db url not found in env file");
    }

    const conn = await mongoose.connect(mongoURL);

    console.log(`MongoDB connected: ${conn.connection.name}`);
  } catch (error) {
    const err = error as Error;
    console.log("MongoDB connection error", err.message);
    throw err;
  }
};


export default connectDB;
