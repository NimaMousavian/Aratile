export interface IProduct {
  id: number;
  name: string;
  physicalInventory: string;
  accountableInventory: string;
  grade: string;
  price: number;
}

export interface ISupplyRequest {
  id: number;
  title: string;
  requestCount: number;
  grade: string;
  status: string;
  dateCreated: string;
  dateModified: string;
}
