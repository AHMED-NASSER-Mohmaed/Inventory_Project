const mongoose = require("mongoose")
const CInventory= require("./CInventory");

const SInventorySchema = new mongoose.Schema({
});
  
module.exports =CInventory.discriminator("SInventory", SInventorySchema);
  
  