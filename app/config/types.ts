export interface IProduct {
  id: number;
  title: string;
  quantity: string;
  note: string;
  code: string;
  Price: number;
  hasColorSpectrum: boolean;
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
