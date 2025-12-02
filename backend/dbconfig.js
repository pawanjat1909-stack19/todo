import mongoose from "mongoose";

const url = "mongodb://localhost:27017";
const dbName = "node-project";

const connectDB = async () => {
  try {
    await mongoose.connect(`${url}/${dbName}`);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
