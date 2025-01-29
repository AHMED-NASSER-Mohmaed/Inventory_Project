const mongoose = require("mongoose")
const CInventory= require("./cinventory.model");

const SInventorySchema = new mongoose.Schema({
});
  
module.exports =CInventory.discriminator("SInventory", SInventorySchema);
  
  