const mongoose = require('mongoose');
const inventory = require('./inventory.model'); 


const CInventorySchema = new mongoose.Schema({});


const CInventory = Inventory.discriminator('CInventory', CInventorySchema);

module.exports = CInventory;


