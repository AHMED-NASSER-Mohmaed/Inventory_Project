


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


module.exports.inboxResult=inboxResult

module.exports.sendResponseToClint=sendResponseToClint;