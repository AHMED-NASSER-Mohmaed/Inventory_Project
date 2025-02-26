export interface ProductImage {
  _id: string;
  fileId: string;
  url: string;
}

export interface Product {
  _id: string;
  name: string;
  code: string;
  markupPercentage: string;
  cost: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  status: string;
  supplier: string;
  images: ProductImage[];
}

export interface OffProduct {
  _id: string;
  branch: string;
  product: Product;
  createdAt: string;
  stock: string;
  updatedAt: string;
}
