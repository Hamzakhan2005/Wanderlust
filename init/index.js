const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  data.data = data.data.map((obj) => ({
    ...obj,
    owner: "653e810c961c4ed6fb8c3413",
  }));
  await Listing.insertMany(data.data);
  console.log("data was saved");
};

initDB();
