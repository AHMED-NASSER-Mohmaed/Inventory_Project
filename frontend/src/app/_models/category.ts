export class category {
Cname: any;


    constructor(
  
           public _id :string,
           public parentCatId :string,
            public name:string,
            public isActive:boolean  
            
    ) {
       
    }
}
