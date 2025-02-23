const mongoose=require("mongoose");

const SupplierProductSchema = new mongoose.Schema({

    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    
    originalCost: { type: Number, required: true },
    
    markupPercentage: { type: Number, default: 0 },
    
    // You might include an isActive field if you need to mark a supplier's product as unavailable.
    isActive: { type: Boolean, default: true }

}, { timestamps: true });



const SupplierProduct = mongoose.model("SupplierProduct", SupplierProductSchema);
