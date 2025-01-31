const mongoose = require('mongoose');
const Inventory = require('./inventory.model'); 

const SInventorySchema = new mongoose.Schema({});


const SInventory = Inventory.discriminator('SInventory', SInventorySchema);

module.exports = SInventory;