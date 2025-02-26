export interface ProductImage {
  _id: any;
  fileId: any;
  url: any;
}

export interface Product {
  _id: any;
  name: any;
  code: any;
  markupPercentage: any;
  cost: any;
  price: any;
  description: any;
  category: any;
  brand: any;
  isActive: boolean;
  status: any;
  sellers: any[];
  supplier: any;
  images: ProductImage[];
  __v: number;
}

export interface OffProduct {
  _id: any;
  branch: any;
  product: Product;
  stock: any;
  createdAt: any;
  updatedAt: any;
}
