export interface ApiResponse<T> {
    status: string;
    result: {
        result: T[];
        total: number;
    };
    count?: number;
}

export interface SearchResponse {
    data: {
        total: number;
    };
}
