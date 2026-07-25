import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    try {
        await mongoose.connect(`${mongoURI}/lead-management-db`);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;