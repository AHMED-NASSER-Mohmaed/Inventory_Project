import { Product } from './products';
import { category } from './category';

export interface ProductResponse {
  message: string;
  data: {
    result: ProductItem[];
    total: number;
    next?: {
      page: number;
      limit: number;
    };
    previous?: {
      page: number;
      limit: number;
    };
  };
}

export interface CategoryResponse {
  message: string;
  data: category[];
}

export interface ProductItem {
  _id: string;
  seller: {
    _id: string;
    companyName:string;
  };
  product: {
    _id: string;
    name: string;
    price: number;
    images: {
      _id: string;
      fileId: string;
      url: string;
    }[];
  };
}

export interface BrandResponse {
  message: string;
  data: Brand[];
}

export interface Brand {
  _id: string;
  Bname: string;
}
