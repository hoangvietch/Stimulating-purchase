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
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

schema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.accessToken;
  return obj;
};

const storeModel = model("Store", schema);

export default storeModel;
