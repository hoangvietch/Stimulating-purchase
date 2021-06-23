import { model, Schema } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  country: String,
  plan: {
    type: String,
    enum: ["free", "medium", "pro"],
    default: "free",
  },
  address_country: String,
  address_city: String,
  address_line1: String,
  address_line2: String,
  address_state: String,
  address_zip: String,
});

const userModel = model("User", userSchema);

export default userModel;
