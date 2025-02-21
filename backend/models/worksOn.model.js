const { type } = require("jquery");
const mongoose = require("mongoose");

const WorksOnSchema= mongoose.Schema({

    employee:{type:mongoose.Schema.ObjectId , ref:"Staff"},
    
    type:{type:String,enum:["clerk", "cashier" , "admin"],require:true, default:"employee"},

    branch:{type:mongoose.Schema.ObjectId , ref:"Branch" , required:true }

},{
    timestamps:true
})