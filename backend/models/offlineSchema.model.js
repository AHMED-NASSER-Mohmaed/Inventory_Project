const mongoose = require("mongoose");
const APP_CONFIG=require("../config/app.config");
const notification=require("./notification.model");
// offlineProducts

const OfflineProductsSchema = new mongoose.Schema({

    branch: { type: Number, ref: "Branch", required: true },//offline branches only 

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    stock: { type: Number, required: true, default: 0 },


}, { timestamps: true });

OfflineProductsSchema.index({ branch: 1, product: 1 }, { unique: true });

// isActive:{  type:Boolean , default:true, }
/*
OfflineProductsSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate','findByIdAndUpdate'], async function (next) {

    const update = this.getUpdate();
    const filter = this.getQuery();  

    console.log(update, "********************************************************Filter used to find document");

    // Extract stock value safely
    const stock = update?.$set?.stock ?? update?.stock;

    if(!stock)
        stock = update?.$inc?.stock ?? update?.stock;

    console.log(stock);

    // Validate stock value
    if (stock !== undefined && stock < 0) {
        return next(new AppError("Invalid field! Stock must be greater than 0.", APP_CONFIG.HTTP_BAD_REQUEST));
    }

    // Check if stock is 0
    if (stock === 0) {
        const onObj = await this.model.findOne(filter); // Fetch the full document

        if (!onObj) {
            return next(new AppError("Product not found.", APP_CONFIG.HTTP_NOT_FOUND));
        }

        if (onObj.seller?.toString() === APP_CONFIG.COMPANY_ID?.toString()) {
            console.log(onObj.branch.toString());
            await notification.create({ product:new mongoose.Types.ObjectId(onObj.product.toString()), branch:onObj.branch });
        }
    }

    next();
});
*/

OfflineProductsSchema.post(['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate'], async function (doc) {
    if (!doc) return; // Ensure document exists

    console.log(doc, "Updated Document After Update");

    // Check if stock is 0
    if (doc.stock === 0) {
        if (doc.seller?.toString() === APP_CONFIG.COMPANY_ID?.toString()) {
            console.log(doc.branch.toString());

            await notification.create({ 
                product: new mongoose.Types.ObjectId(doc.product.toString()), 
                branch: doc.branch 
            });
        }
    }
});


module.exports = mongoose.model("OfflineProducts", OfflineProductsSchema);
