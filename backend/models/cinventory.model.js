const mongoose = require('mongoose');
const Inventory = require('./inventory.model'); 


const CInventorySchema = new mongoose.Schema({});


const CInventory = Inventory.discriminator('CInventory', CInventorySchema);

module.exports = CInventory;


