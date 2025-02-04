

const inboxResult=(results,total,page,limit)=>{


    let result={};

    result.result=results;



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

module.exports=inboxResult