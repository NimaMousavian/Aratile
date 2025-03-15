export interface IProduct {
  id: number;
  title: string;
  quantity: string;
  note: string;
  code: string;
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
