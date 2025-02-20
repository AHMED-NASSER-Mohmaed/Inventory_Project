const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

    parentCatId: { type: mongoose.Schema.ObjectId, default: null, ref: "Category" },
    name: { type: String, required: true },

    isActive: { type: Boolean, default: true },
});


module.exports = mongoose.model("Category", CategorySchema);


