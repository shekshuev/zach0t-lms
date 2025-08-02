import type { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";
import { uuid } from "uuidv4";
import { USER_ROLES, USER_STATUSES } from "~/types/user";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: "user",
  },
  status: {
    type: String,
    enum: USER_STATUSES,
    default: "active",
    required: true,
  },
  group: {
    type: String,
    index: true,
  },
  resetPasswordToken: {
    type: String,
    default: () => uuid(),
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

export type UserDocument = HydratedDocument<InferSchemaType<typeof UserSchema>>;

export const User = model("User", UserSchema);
