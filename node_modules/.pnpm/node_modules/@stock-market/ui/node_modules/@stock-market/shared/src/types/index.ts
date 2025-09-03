// packages/shared/src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'trader' | 'viewer';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Order {
  id: string;
  stockId: string;
  stockName: string;
  stockSymbol: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Trade {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
