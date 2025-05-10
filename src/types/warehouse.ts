
export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentUtilization: number;
  isActive: boolean;
  managerId?: string;
  description?: string;
  createdAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  location: string;
  capacity: number;
  managerId?: string;
  description?: string;
}

export interface UpdateWarehouseRequest extends CreateWarehouseRequest {
  isActive: boolean;
}
