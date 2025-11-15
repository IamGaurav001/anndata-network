
import mongoose from 'mongoose';

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);


    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } 
};

export default connectDB;
