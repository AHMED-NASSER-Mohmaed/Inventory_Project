export interface Product {
  productId: string;
  productName: string;
  productUrlImage: string;
  productCode: string;
  productPrice: number;
  productStock: number;
  productRequestedQuantity: number;
  productFulfilledQuantity: number;
  productCanceledQuantity: number;
}

export interface Order {
  orderId: string;
  orderStatus: string;
  customerName: string;
  sellerName: string;
  products: Product[];
  orderTotalQty: number;
  orderTotalPrice: number;
  createdAt: string;
  updatedAt: string;
}
