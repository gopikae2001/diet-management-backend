import React, { useState, useEffect } from "react";
// import "./DietOrderForm.css";
import '../styles/DietOrder.css'
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageContainer from "../components/PageContainer";
import SectionHeading from "../components/SectionHeading";  
import FormInputs from "../components/Input";
import ButtonWithGradient from "../components/button";
import AddressInput from "../components/Addressinput";
import Searchbar from "../components/Searchbar";
import FormInputType from "../components/Inputtype";
import FormDateInput from "../components/Date";
import { useNavigate } from 'react-router-dom';
import { Form, useLocation } from 'react-router-dom';
import { Flex } from "antd";
import { dietOrdersApi, dietPackagesApi } from '../services/api';
import type { DietOrder, DietPackage } from '../services/api';


interface DietOrderFormProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface MealItem {
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  unit: string;
}

// Function to load diet packages from API
const loadDietPackages = async (): Promise<DietPackage[]> => {
  try {
    return await dietPackagesApi.getAll();
  } catch (error) {
    console.error('Failed to load diet packages:', error);
    return [];
  }
};



const DietOrderForm: React.FC<DietOrderFormProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dietPackages, setDietPackages] = useState<DietPackage[]>([]);
  const [orders, setOrders] = useState<DietOrder[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [packagesData, ordersData] = await Promise.all([
          dietPackagesApi.getAll(),
          dietOrdersApi.getAll()
        ]);
        setDietPackages(packagesData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  interface FormState {
    patientName: string;
    patientId: string;
    contactNumber: string;
    age: string;
    bed: string;
    ward: string;
    floor?: string;
    dietPackage: string;
    packageRate: string;
    startDate: string;
    endDate: string;
    doctorNotes: string;
    status: "active" | "paused" | "stopped";
    approvalStatus: "pending" | "approved" | "rejected";
  }

  // Initialize form with default values or values from location state
  const [form, setForm] = useState<FormState>(() => {
    const state = location.state || {};
    return {
      patientName: state.patientName || "",
      patientId: state.patientId || "",
      contactNumber: state.contactNumber || "", 
      age: state.age || "",
      bed: state.bed || "",
      ward: state.ward || "",
      floor: state.floor || "",
      dietPackage: "",
      packageRate: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      doctorNotes: state.doctorNotes || "",
      status: "active",
      approvalStatus: "pending"
    };
  });
  
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<DietPackage | null>(null);

  // Update selected package details when dietPackage changes
  useEffect(() => {
    if (form.dietPackage) {
      const pkg = dietPackages.find(p => p.id === form.dietPackage);
      setSelectedPackageDetails(pkg || null);
    } else {
      setSelectedPackageDetails(null);
    }
  }, [form.dietPackage, dietPackages]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form state
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Update selected package details and rate when diet package changes
    if (name === 'dietPackage') {
      const selected = dietPackages.find(pkg => pkg.id === value);
      setSelectedPackageDetails(selected || null);
      
      // Update the rate field when a package is selected
      if (selected) {
        setForm(prev => ({
          ...prev,
          packageRate: selected.totalRate.toString()
        }));
      } else {
        setForm(prev => ({
          ...prev,
          packageRate: ""
        }));
      }
    }
    if (name === 'contactNumber') {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, contactNumber: numbersOnly }));
      return;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await dietOrdersApi.delete(id);
        const updatedOrders = await dietOrdersApi.getAll();
        setOrders(updatedOrders);
      } catch (error) {
        console.error('Failed to delete order:', error);
        setInfoMessage('Failed to delete order. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setForm({
      patientName: "",
      patientId: "",
      age:"",
      contactNumber: "", 
      bed: "",
      ward: "",
      dietPackage: "",
      packageRate: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      doctorNotes: "",
      status: "active",
      approvalStatus: "pending"
    });
  };

  const handleEdit = (order: DietOrder) => {
    setForm({
      patientName: order.patientName,
      patientId: order.patientId,
      age: order.age,
      contactNumber: order.contactNumber || "", 
      bed: order.bed,
      ward: order.ward,
      dietPackage: order.dietPackage,
      packageRate: order.packageRate?.toString() || "",
      startDate: order.startDate,
      endDate: order.endDate || "",
      doctorNotes: order.doctorNotes,
      status: order.status,
      approvalStatus: order.approvalStatus
    });
    setEditingId(order.id);
    // showNotification('Editing order...', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Notification state for showing message if user clicks No
  const [infoMessage, setInfoMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) {
      // Only for creating new order
      const confirmCollect = window.confirm('Are you collecting the amount from patient?');
      if (!confirmCollect) {
        setInfoMessage('Please collect amount from patient.');
        // Use setTimeout to ensure the scroll happens after the state update
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 10);
        return;
      } else {
        setInfoMessage("");
      }
    }
    if (form.contactNumber.length !== 10) {
      setInfoMessage('Contact number must be 10 digits.');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }
    
    try {
      const selectedPackage = dietPackages.find(pkg => pkg.id === form.dietPackage);
      const orderData: Omit<DietOrder, 'id'> = {
        ...form,
        floor: form.floor || '',
        packageRate: selectedPackage?.totalRate?.toString() || '',
      };

      if (editingId) {
        await dietOrdersApi.update(editingId, orderData);
      } else {
        await dietOrdersApi.create(orderData);
      }

      // Refresh orders from API
      const updatedOrders = await dietOrdersApi.getAll();
      setOrders(updatedOrders);
      
      setEditingId(null);
      resetForm();
      if (!editingId) {
        navigate('/dietician');
      }
    } catch (error) {
      console.error('Failed to save order:', error);
      setInfoMessage('Failed to save order. Please try again.');
    }
  };

  

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>
    <PageContainer>
        {/* <div className="header"> */}
        <SectionHeading title="Diet Order" subtitle="Meal preparation and delivery management" />
      {/* </div> */}
      
      <div className="form-section3">
        {/* <div className="section-header">Diet Order</div> */}
        {infoMessage && (
          <div style={{ color: '#b71c1c', fontWeight: 600, marginBottom: 10 }}>{infoMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start',marginBottom:'10px' }}>
          <div style={{ flex: 1 }}>
              <FormInputs label="Patient ID" name="patientId" value={form.patientId} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <FormInputs label="Patient Name" name="patientName" value={form.patientName} onChange={handleChange} />
            </div>
            
           
          </div>
          <div className="form-row" style={{  display: 'flex', gap: '1rem', alignItems: 'flex-start',marginBottom:'10px' }}>
            <div style={{flex:1}}>
              <FormInputs label="Age" name="age" value={form.age} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <FormInputs label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Enter 10-digit number" type="tel" />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start',marginBottom:'10px' }}>
            <div style={{ flex: 1 }}>
              <FormInputs label="Bed" name="bed" value={form.bed} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <FormInputs label="Ward" name="ward" value={form.ward} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start',marginBottom:'10px' }}>
            <div style={{ flex: 1 }}>
              <FormInputType 
                label="Diet Package" 
                name="dietPackage" 
                value={form.dietPackage} 
                onChange={handleChange} 
                options={dietPackages.map(pkg => ({ value: pkg.id, label: `${pkg.name} ${pkg.type ? `(${pkg.type})` : ''}` }))} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormInputs 
                label="Package Rate" 
                name="packageRate" 
                value={form.packageRate} 
                readOnly 
                onChange={() => {}} 
              />
            </div>
          </div>
                {/* {dietPackages.length === 0 && (
                  <option value="" disabled>No diet packages available. Please create one first.</option>
                )} */}
               

              {selectedPackageDetails && (
                <div className="package-meals" style={{ 
                  marginTop: '15px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Meal Plan:</h4>
                  
                  {selectedPackageDetails.breakfast.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#555' }}>Breakfast</h5>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {selectedPackageDetails.breakfast.map((item, idx) => (
                          <li key={`breakfast-${idx}`}>
                            {item.quantity} {item.unit} {item.foodItemName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedPackageDetails.brunch.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#555' }}>Brunch</h5>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {selectedPackageDetails.brunch.map((item, idx) => (
                          <li key={`brunch-${idx}`}>
                            {item.quantity} {item.unit} {item.foodItemName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedPackageDetails.lunch.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#555' }}>Lunch</h5>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {selectedPackageDetails.lunch.map((item, idx) => (
                          <li key={`lunch-${idx}`}>
                            {item.quantity} {item.unit} {item.foodItemName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedPackageDetails.dinner.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#555' }}>Dinner</h5>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {selectedPackageDetails.dinner.map((item, idx) => (
                          <li key={`dinner-${idx}`}>
                            {item.quantity} {item.unit} {item.foodItemName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedPackageDetails.evening.length > 0 && (
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#555' }}>Evening</h5>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {selectedPackageDetails.evening.map((item, idx) => (
                          <li key={`evening-${idx}`}>
                            {item.quantity} {item.unit} {item.foodItemName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #e0e0e0' }}>
                    <p style={{ margin: '5px 0', fontWeight: '500' }}>Nutritional Information:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                      <div>Calories: {selectedPackageDetails.totalNutrition.calories.toFixed(0)} kcal</div>
                      <div>Protein: {selectedPackageDetails.totalNutrition.protein.toFixed(1)}g</div>
                      <div>Carbs: {selectedPackageDetails.totalNutrition.carbohydrates.toFixed(1)}g</div>
                      <div>Fat: {selectedPackageDetails.totalNutrition.fat.toFixed(1)}g</div>
                    </div>
                  </div>
                </div>
              )}
            {/* </div> */}
          {/* </div> */}

          <div className="form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start',marginBottom:'10px' }}>
            <div style={{ flex: 1 }}>
              <FormDateInput label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <FormDateInput label="End Date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
          </div>
      
          {/* <FormDateInput label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} />
          <FormDateInput label="End Date" name="endDate" value={form.endDate} onChange={handleChange} /> */}

         
          

          <div className="form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start',marginBottom:'10px' }}>
            <div style={{ flex: 1 }}>
              <FormInputType label="Status" name="status" value={form.status} onChange={handleChange} options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'stopped', label: 'Stopped' },
              ]} />
            </div>
         
            <div style={{ flex: 1 }}>
              <FormInputType label="Approval Status" name="approvalStatus" value={form.approvalStatus} onChange={handleChange} options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]} />
            </div>
          </div>
          <div style={{width:'50%',marginBottom:'10px'}}>
            <AddressInput label="Doctor Notes" placeholder="Enter doctor notes" name="doctorNotes" value={form.doctorNotes} onChange={handleChange} />
          </div>
          <ButtonWithGradient className="primary" type="submit">
            {editingId ? 'Update Order' : 'Create Diet Order'}
          </ButtonWithGradient>
           
        </form>
      </div>
      {/* </div> */}

      {/* {orders.length > 0 && (
        <div className="form-section3">
          <div className="section-header">Diet Orders</div>
          <table className="order-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Patient</th>
                <th>Bed/Ward</th>
                <th>Package</th>
                <th>Rate</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, index) => (
                <tr key={o.id}>
                  <td>{index + 1}</td>
                  <td>{o.patientName}</td>
                  <td>{o.bed} / {o.ward}</td>
                  <td>{o.packageName || dietPackages.find(p => p.id === o.dietPackage)?.name || "Unknown"}</td>
                  <td>₹{o.packageRate?.toFixed(2) || dietPackages.find(p => p.id === o.dietPackage)?.totalRate?.toFixed(2) || '0.00'}</td>
                  <td>{new Date(o.startDate).toLocaleDateString()}</td>
                  <td>{o.endDate ? new Date(o.endDate).toLocaleDateString() : '-'}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                  <td><span className="status-badge">{o.approvalStatus}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-text edit"
                        onClick={() => handleEdit(o)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-text reject"
                        onClick={() => handleDelete(o.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
    {/* </div> */}
  </PageContainer>
    <Footer/>
    </>
  );
}
export default DietOrderForm;