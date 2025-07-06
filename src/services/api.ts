const API_BASE_URL = 'http://192.168.29.181:3001';

export interface DietOrder {
  id: string;
  patientName: string;
  patientId: string;
  contactNumber: string;
  age: string;
  bed: string;
  ward: string;
  floor: string;
  dietPackage: string;
  packageRate: string;
  startDate: string;
  endDate: string;
  doctorNotes: string;
  status: 'active' | 'paused' | 'stopped';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  dieticianInstructions?: string;
}

export interface DietPackage {
  id: string;
  name: string;
  type: string;
  breakfast: MealItem[];
  brunch: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  evening: MealItem[];
  totalRate: number;
  totalNutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface MealItem {
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  unit: string;
  time?: string;
  period?: 'AM' | 'PM';
}

export interface DietRequest {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  contactNumber: string;
  bed: string;
  ward: string;
  floor: string;
  doctor: string;
  doctorNotes: string;
  status: 'Pending' | 'Diet Order Placed' | 'Rejected';
}

export interface FoodItem {
  id: string;
  name: string;
  foodType: string;
  category: string;
  unit: string;
  quantity: string;
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
  price: string;
  pricePerUnit: string;
}

export interface CanteenOrder {
  id: string;
  patientName: string;
  bed: string;
  ward: string;
  dietPackageName: string;
  dietType: string;
  foodItems: string[];
  specialNotes: string;
  status: 'pending' | 'active' | 'paused' | 'stopped' | 'prepared' | 'delivered';
  prepared: boolean;
  delivered: boolean;
  dieticianInstructions?: string;
  mealItems?: Record<string, MealItem[]>;
}

export interface CustomPlan {
  id: string;
  packageName: string;
  dietType: string;
  meals: Record<string, any[]>;
  amount: number;
}

// Generic API functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Diet Orders API
export const dietOrdersApi = {
  getAll: () => apiCall('dietOrders'),
  getById: (id: string) => apiCall(`dietOrders/${id}`),
  create: (order: Omit<DietOrder, 'id'>) => 
    apiCall('dietOrders', {
      method: 'POST',
      body: JSON.stringify({ ...order, id: Date.now().toString() }),
    }),
  update: (id: string, order: Partial<DietOrder>) =>
    apiCall(`dietOrders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(order),
    }),
  delete: (id: string) =>
    apiCall(`dietOrders/${id}`, { method: 'DELETE' }),
};

// Diet Packages API
export const dietPackagesApi = {
  getAll: () => apiCall('dietPackages'),
  getById: (id: string) => apiCall(`dietPackages/${id}`),
  create: (pkg: Omit<DietPackage, 'id'>) =>
    apiCall('dietPackages', {
      method: 'POST',
      body: JSON.stringify({ ...pkg, id: Date.now().toString() }),
    }),
  update: (id: string, pkg: Partial<DietPackage>) =>
    apiCall(`dietPackages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(pkg),
    }),
  delete: (id: string) =>
    apiCall(`dietPackages/${id}`, { method: 'DELETE' }),
};

// Diet Requests API
export const dietRequestsApi = {
  getAll: () => apiCall('dietRequests'),
  getById: (id: string) => apiCall(`dietRequests/${id}`),
  create: (request: Omit<DietRequest, 'id'>) =>
    apiCall('dietRequests', {
      method: 'POST',
      body: JSON.stringify({ ...request, id: Date.now().toString() }),
    }),
  update: (id: string, request: Partial<DietRequest>) =>
    apiCall(`dietRequests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    }),
  delete: (id: string) =>
    apiCall(`dietRequests/${id}`, { method: 'DELETE' }),
};

// Food Items API
export const foodItemsApi = {
  getAll: () => apiCall('foodItems'),
  getById: (id: string) => apiCall(`foodItems/${id}`),
  create: (item: Omit<FoodItem, 'id'>) =>
    apiCall('foodItems', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  update: (id: string, item: Partial<FoodItem>) =>
    apiCall(`foodItems/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(item),
    }),
  delete: (id: string) =>
    apiCall(`foodItems/${id}`, { method: 'DELETE' }),
};

// Canteen Orders API
export const canteenOrdersApi = {
  getAll: () => apiCall('canteenOrders'),
  getById: (id: string) => apiCall(`canteenOrders/${id}`),
  create: (order: Omit<CanteenOrder, 'id'>) =>
    apiCall('canteenOrders', {
      method: 'POST',
      body: JSON.stringify({ ...order, id: Date.now().toString() }),
    }),
  update: (id: string, order: Partial<CanteenOrder>) =>
    apiCall(`canteenOrders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(order),
    }),
  delete: (id: string) =>
    apiCall(`canteenOrders/${id}`, { method: 'DELETE' }),
};

// Custom Plans API
export const customPlansApi = {
  getAll: () => apiCall('customPlans'),
  getById: (id: string) => apiCall(`customPlans/${id}`),
  create: (plan: Omit<CustomPlan, 'id'>) =>
    apiCall('customPlans', {
      method: 'POST',
      body: JSON.stringify({ ...plan, id: Date.now().toString() }),
    }),
  update: (id: string, plan: Partial<CustomPlan>) =>
    apiCall(`customPlans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(plan),
    }),
  delete: (id: string) =>
    apiCall(`customPlans/${id}`, { method: 'DELETE' }),
}; 