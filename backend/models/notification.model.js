const mongoose = require("mongoose");
const { APP_CONFIG } = require("../config/app.config");


const notificationSchema= mongoose.Schema({
   
   product : {type:mongoose.Schema.Types.ObjectId , ref:"Product"},
   
   branch : {type:Number, ref:"Branch"},
   
   status : {type:String , enum:[ APP_CONFIG.SEEN_STATUS , APP_CONFIG.NOT_SEEN_STATUS , APP_CONFIG.DELETED_STATUS ],
    default : APP_CONFIG.NOT_SEEN_STATUS
   }
},{
    timestamp:true
});



module.exports = mongoose.model("notifiaction", notificationSchema ); 