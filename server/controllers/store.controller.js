import storeModel from "../models/store.model";

class StoreController {
  constructor() {
    this.store = storeModel;
  }
  findStoreByName = async (storeName) => {
    try {
      const data = await this.store.findOne({ name: storeName }).lean();
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  createStore = async (storeData) => {
    try {
      const data = await this.store.create(storeData, { new: true });
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  updateStatusStoreById = async (_id, status) => {
    try {
      const data = await this.store.findByIdAndUpdate(
        { _id: _id },
        { active: status }
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  updateStatusStoreByName = async (storeName, status) => {
    try {
      const data = await this.store.findOneAndUpdate(
        { name: storeName },
        { active: status }
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  };
}

const storeController = new StoreController();

export default storeController;
