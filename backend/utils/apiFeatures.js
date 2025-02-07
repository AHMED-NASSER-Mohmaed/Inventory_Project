const _ = require('lodash'); // Lodash for handling nested paths
const mongoose = require('mongoose');
/**
 * Check if a given attribute and value exist in the user document.
 * @param {string} userId - The ID of the user to check.
 * @param {string} attributePath - The path to the attribute (e.g., "photo.fileId").
 * @param {*} value - The value to check for.
 * @returns {Promise<boolean>} - True if the attribute exists with the given value, false otherwise.
 */
async function checkIfAttributeExists(model,userId, attributePath, value) {
  try {
    // Find the user by ID
    const document = await model.findById( new mongoose.Types.ObjectId(userId));
    if (!document) {
      throw new Error("objdocumentect not found");
    }

    // Use lodash to get the value of the nested attribute
    const attributeValue = _.get(document, attributePath);


     // If the attribute value is an ObjectId, convert the input value to ObjectId for comparison
     if (attributeValue instanceof mongoose.Types.ObjectId) {
      const valueAsObjectId = mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;
      return attributeValue.equals(valueAsObjectId);
    }



    // Check if the attribute value matches the provided value
    return attributeValue === value;
  } catch (error) {
    console.error("Error checking attribute:", error);
    throw error;
  }
}


const inboxResult=(results,total,page,limit)=>{

    let result={};

    result.result=results;
    result.total=total;


     let startIndex =(page-1)*limit;
     let endIndex   =page*limit;


    if(startIndex>0&&startIndex<total){
        result.previous={
            page:page-1,
            limit:limit,
        }
    }
    let newLimit= total - (page*limit)

    
    if(newLimit>0 && newLimit < total){
        result.next={
            page:page+1,
            limit: limit,
        }
    }


    return result;

}

sendResponseToClint=(res,statusCode,message_,data_)=>{
    res.status(statusCode).json({
        message:message_,
        data:data_,
    })
}

module.exports={
    checkIfAttributeExists,
    inboxResult,
    sendResponseToClint
}
