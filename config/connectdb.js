import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "author",
    };
    await mongoose.connect(DATABASE_URL,DB_OPTIONS);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;