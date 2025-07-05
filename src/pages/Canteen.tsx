import { useState, useEffect } from "react";
import "../styles/canteen.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import PageContainer from "../components/PageContainer";
import FormInputType from "../components/Inputtype";
import Table from "../components/Table";
import DeleteButton from "../components/DeleteButton";
import { canteenOrdersApi, dietPackagesApi } from '../services/api';
import type { CanteenOrder, DietPackage } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


type Status = "pending" | "active" | "paused" | "stopped" | "prepared" | "delivered";


interface CanteenInterfaceProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}


const CanteenInterface: React.FC<CanteenInterfaceProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast");
  const [mealOrders, setMealOrders] = useState<CanteenOrder[]>([]);
  const [dietPackages, setDietPackages] = useState<DietPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load orders and packages from API
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const [orders, packages] = await Promise.all([
        canteenOrdersApi.getAll(),
        dietPackagesApi.getAll()
      ]);
      setMealOrders(orders);
      setDietPackages(packages);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadOrders();
  }, [selectedMeal]);




  // Update order status in API
  const updateOrderStatus = async (id: string, status: Status) => {
    try {
      const orderToUpdate = mealOrders.find(order => order.id === id);
      if (!orderToUpdate) return;

      const updatedOrder = {
        ...orderToUpdate,
        status: status
      };

      await canteenOrdersApi.update(id, updatedOrder);
      await loadOrders(); // Reload orders
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleMarkActive = (id: string) => {
    updateOrderStatus(id, 'active');
  };

  const handleMarkPrepared = (id: string) => {
    updateOrderStatus(id, 'prepared');
  };

  const handleMarkDelivered = (id: string) => {
    updateOrderStatus(id, 'delivered');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await canteenOrdersApi.delete(id);
        await loadOrders(); // Reload orders
        toast.error('Order deleted successfully');
      } catch (error) {
        console.error('Failed to delete order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  // Get meal-specific food items for an order
  const getMealSpecificItems = (order: CanteenOrder) => {
    // Find the diet package for this order
    const dietPackage = dietPackages.find(pkg => pkg.name === order.dietPackageName);
    
    if (dietPackage && dietPackage[selectedMeal as keyof DietPackage]) {
      const mealItems = dietPackage[selectedMeal as keyof DietPackage] as any[];
      return mealItems.map(item => `${item.foodItemName} - ${item.quantity} ${item.unit}`);
    }
    
    // Fallback to all food items if no meal-specific data
    return order.foodItems || [];
  };

  // Calculate total quantities for the selected meal
  const totalQuantities = mealOrders.reduce((acc, order) => {
    const mealSpecificItems = getMealSpecificItems(order);
    
    mealSpecificItems.forEach(item => {
      // Parse food item string (format: "Item Name - Quantity Unit")
      const parts = item.split(' - ');
      if (parts.length >= 2) {
        const itemName = parts[0];
        const quantityPart = parts[1];
        const quantityMatch = quantityPart.match(/^(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 0;
        const unit = quantityPart.replace(/^\d+\s*/, '').trim(); // Extract unit
        
        if (acc[itemName]) {
          acc[itemName].quantity += quantity;
        } else {
          acc[itemName] = { quantity, unit };
        }
      }
    });
    return acc;
  }, {} as Record<string, { quantity: number; unit: string }>);


  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showCalculator showDate showTime />
    <PageContainer>
    {/* <div className="canteen-container"> */}
      {/* <div className="header"> */}
        <SectionHeading title="Canteen Interface" subtitle="Meal preparation and delivery management" />
      {/* </div> */}


      <div className="card mb-4 w-30">
        {/* <label className="label">Select Meal Type</label>
        <select
          value={selectedMeal}
          onChange={(e) => setSelectedMeal(e.target.value)}
          className="select"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="brunch">Brunch</option>
          <option value="evening">Evening</option>
        </select> */}
        <FormInputType name="" label="Select Meal type" value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}
            options={[
                                  {label: "Breakfast", value: "breakfast"},
                                  { label: "Brunch", value: "brunch" },
                                  { label: "Lunch", value: "lunch" },
                                  { label: "Evening", value: "evening" },
                                  { label: "Dinner", value: "dinner" },
                                 
                                    
                                ]}/>
      </div>


      <div className="header">Total Quantity Summary - {selectedMeal.toUpperCase()}</div>
      <div className="card grid mb-4">
        {Object.entries(totalQuantities).map(([item, itemData]) => (
          <div key={item} className="summary-box">
            <div className="item-name">{item}</div>
            <div className="item-quantity">{itemData.quantity} {itemData.unit}</div>
          </div>
        ))}
      </div>


      <div className="header">Patient Meal Orders - {selectedMeal.toUpperCase()}</div>
      <div className="card">
        {isLoading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <Table
            data={mealOrders.map((order, index) => {
              // Get meal-specific food items
              const mealSpecificItems = getMealSpecificItems(order);
              
              return {
                ...order,
                serialNo: index + 1,
                patientInfo: `${order.patientName}`,
                bedWard: `${order.bed} / ${order.ward}`,
                foodItemsList: mealSpecificItems.join(', ') || 'N/A',
                specialNotesDisplay: order.specialNotes ? (
                  <span className="badge warning">{order.specialNotes}</span>
                ) : null,
                statusDisplay: (
                  <span className={`badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                ),
                orderStatus: (
                  <div className="button-group">
                    <button
                      className="btn green"
                      disabled={order.status !== 'pending'}
                      onClick={() => handleMarkActive(order.id)}
                    >
                      Active
                    </button>
                    <button
                      className="btn green"
                      disabled={order.status !== 'active'}
                      onClick={() => handleMarkPrepared(order.id)}
                    >
                      Prepared
                    </button>
                    <button
                      className="btn blue"
                      disabled={order.status !== 'prepared'}
                      onClick={() => handleMarkDelivered(order.id)}
                    >
                      Delivered
                    </button>
                  </div>
                ),
                action: (
                  <DeleteButton onClick={() => handleDelete(order.id)} />
                )
              };
            })}
            columns={[
              { key: 'serialNo', header: 'S.No' },
              { key: 'patientInfo', header: 'Patient' },
              { key: 'bedWard', header: 'Bed/Ward' },
              { key: 'dietType', header: 'Diet Type' },
              { key: 'foodItemsList', header: 'Food Items' },
              { key: 'specialNotesDisplay', header: 'Special Notes' },
              { key: 'statusDisplay', header: 'Status' },
              { key: 'orderStatus', header: 'Order Status' },
              { key: 'action', header: 'Action' }
            ]}
          />
        )}
      </div>
    {/* </div> */}
    </PageContainer>
        <Footer/>
    </>
  );
}
 
export default CanteenInterface;
