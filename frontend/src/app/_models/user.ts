export class User {

    constructor(
        public _id: string,
        public photo: {url: string , fileId: string},
        public firstName: string,
        public lastName: string,
        public email: string ,
        public phoneNumber: string ,
        public userType: string,
        public kind: string,
        public SSN: string,
        public companyName: string,
        public companyRegistrationNumber: string,
        public createdAt: string,
        public updatedAt: string,
        public status: string,
        public isActive: Boolean

    ){}

}
