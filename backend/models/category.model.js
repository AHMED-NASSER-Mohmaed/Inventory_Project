const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

    Cname: { type: String, required: true ,unique:true },

    isActive: { type: Boolean, default: true },
});


module.exports = mongoose.model("Category", CategorySchema);


