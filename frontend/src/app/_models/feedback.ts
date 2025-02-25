export interface Feedback {
    _id: string;
    name: string;
    email: string;
    message: string;
    isSeen: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    seenAt?: string;
}
