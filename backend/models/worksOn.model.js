const mongoose = require("mongoose");
const { APP_CONFIG } = require("../config/app.config");

const WorksOnSchema= mongoose.Schema({

    employee:{type:mongoose.Schema.ObjectId , ref:"Staff"},
    
    type:{type:String,enum:[APP_CONFIG.SUPPERADMIN,APP_CONFIG.CLERK, APP_CONFIG.CASHIER , APP_CONFIG.ADMIN],require:true, default:"staff"},

    branch:{type:Number , ref:"Branch" , required:true }

},{
    timestamps:true
})
WorksOnSchema.index({employee:1},{unique:true})

module.exports = mongoose.model("WorksOn",WorksOnSchema)