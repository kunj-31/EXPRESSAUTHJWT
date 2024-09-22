import mongoose from "mongoose";

//schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true },
});

//MOdel
const UserModel = mongoose.model("user", userSchema);
console.log("user model");
export default UserModel;