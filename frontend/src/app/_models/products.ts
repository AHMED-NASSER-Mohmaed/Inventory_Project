export class Product {


    constructor(
  
            public name: string,
            public code: string,
            public price: number,
            public  images: { fileId: string; url: string; _id: string }[],
            public quantity: number,
            public category: string,
            public sellerId: string,
            public sellerName: string,
            public isActive: boolean = false, // Default values
            public status: boolean = false,
            public description?: string,
            public _id?: string,
            public createdAt?: Date,
            public updatedAt?: Date,
        
        
    ) {
       
    }
}
