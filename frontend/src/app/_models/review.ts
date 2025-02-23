export class Review {
  // added optional user property to hold user details from the API
  user?: {
    photo?: { fileId?: string; url?: string };
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    // ...other user fields if needed...
  };

  constructor(
    public _id: string,
    public customerId: string,
    public productId: string,
    public content: string,
    public rating: number,
    public createdAt: string,
    public updatedAt: string
  ) {}
}
