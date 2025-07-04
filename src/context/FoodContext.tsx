import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface FoodItem {
  id: number;
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

interface FoodContextType {
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  editFoodItem: (id: number, updatedItem: Omit<FoodItem, 'id'>) => void;
  deleteFoodItem: (id: number) => void;
  getFoodItem: (id: number) => FoodItem | undefined;
}

const FOOD_ITEMS_KEY = 'diet_planner_food_items';
const FoodContext = createContext<FoodContextType | undefined>(undefined);

const getStoredFoodItems = (): FoodItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(FOOD_ITEMS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const FoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  // Load items from localStorage on initial render
  useEffect(() => {
    const storedItems = getStoredFoodItems();
    if (storedItems.length > 0) {
      setFoodItems(storedItems);
    }
  }, []);

  // Save to localStorage whenever foodItems change
  useEffect(() => {
    if (foodItems.length > 0) {
      localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems));
    }
  }, [foodItems]);

  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const quantityNum = Number(item.quantity);
    const priceNum = Number(item.price);
    const pricePerUnit = (!isNaN(quantityNum) && quantityNum > 0 && !isNaN(priceNum)) ? (priceNum / quantityNum).toFixed(2) : '';
    const newItem: FoodItem = {
      id: foodItems.length > 0 ? Math.max(...foodItems.map(i => i.id)) + 1 : 1,
      ...item,
      pricePerUnit,
    };
    
    const updatedItems = [...foodItems, newItem];
    setFoodItems(updatedItems);
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems));
  };

  const editFoodItem = (id: number, updatedItem: Omit<FoodItem, 'id'>) => {
    const quantityNum = Number(updatedItem.quantity);
    const priceNum = Number(updatedItem.price);
    const pricePerUnit = (!isNaN(quantityNum) && quantityNum > 0 && !isNaN(priceNum)) ? (priceNum / quantityNum).toFixed(2) : '';
    const updatedItems = foodItems.map(item => 
      item.id === id ? { ...updatedItem, id, pricePerUnit } : item
    );
    setFoodItems(updatedItems);
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems));
  };

  const getFoodItem = (id: number) => {
    return foodItems.find(item => item.id === id);
  };

  const deleteFoodItem = (id: number) => {
    const updatedItems = foodItems.filter(item => item.id !== id);
    setFoodItems(updatedItems);
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems));
  };

  return (
    <FoodContext.Provider value={{ foodItems, addFoodItem, editFoodItem, deleteFoodItem, getFoodItem }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = (): FoodContextType => {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};
