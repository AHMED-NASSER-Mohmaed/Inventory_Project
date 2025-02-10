export class Account {
    constructor(
        public firstName: string,
        public lastName: string,
        public email: string ,
        public phoneNumber: string ,
        public password: string ,
        public passwordConfirm: string ,
        public userType: string,
        public SSN: string,
        public companyName: string,
        public companyRegistrationNumber: string,
    ){}
}
