import { Schema, model, models } from "mongoose";

export interface IUser {
  //Initialising the User Type.
  name: string;
  username: string;
  email: string;
  bio?: string;
  image: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String, required: false },
    image: { type: String, required: false },
    location: { type: String, required: false },
    portfolio: { type: String, required: false },
    reputation: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema); //Defines that the model is of type IUser.

export default User;
