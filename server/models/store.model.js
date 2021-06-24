import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
    },
    scope: {
      type: String,
    },
    active: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const storeModel = model("Store", schema);

export default storeModel;
