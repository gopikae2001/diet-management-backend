import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import FormInputs from '../components/Input';
import Table from '../components/Table';
import '../styles/DietOrder.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ButtonWithGradient from '../components/button';
import { dietOrdersApi } from '../services/api';
import type { DietOrder } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PatientDietHistoryProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}


const PatientDietHistory: React.FC<PatientDietHistoryProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [contactNumber, setContactNumber] = useState('');
  const [results, setResults] = useState<DietOrder[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [allOrders, setAllOrders] = useState<DietOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all diet orders from API on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const orders = await dietOrdersApi.getAll();
        setAllOrders(orders);
      } catch (error) {
        console.error('Failed to load diet orders:', error);
        toast.error('Failed to load diet orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContactNumber(value);
    if (value.length >= 6) { // search after 6+ digits
      const filtered = allOrders.filter(order => 
        order.contactNumber === value && 
        order.approvalStatus === 'approved'
      );
      setResults(filtered);
      setSearched(true);
    } else {
      setResults(null);
      setSearched(false);
    }
  };

  

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
        <SectionHeading title="Patient Diet History" subtitle="Search for a patient's previous diet packages by contact number" />
        <div className="form-section3">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading diet orders...
            </div>
          ) : (
            <>
              <div className="form-row" style={{ maxWidth:'30%', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <FormInputs
                    label="Enter Contact Number"
                    name="contactNumber"
                    value={contactNumber}
                    onChange={handleInputChange}
                    placeholder="Enter patient's contact number"
                  />
                </div>
                {/* <div style={{ flex: 1, marginTop:'1.6rem' }}>
                <ButtonWithGradient text='Go' type='button'/>
                </div> */}
              </div>
            </>
          )}
          

          {!isLoading && searched && (
            results && results.length > 0 ? (
              <Table
                columns={[
                  { key: 'patientName', header: 'Patient Name' },
                  { key: 'patientId', header: 'Patient ID' },
                  { key: 'package', header: 'Package' },
                  { key: 'startDate', header: 'Start Date' },
                  { key: 'endDate', header: 'End Date' },
                  { key: 'status', header: 'Status' },
                  { key: 'approvalStatus', header: 'Approval' }
                ]}
                data={results.map(order => ({
                  id: order.id,
                  patientName: order.patientName,
                  patientId: order.patientId,
                  package: order.packageName || order.dietPackage,
                  startDate: order.startDate,
                  endDate: order.endDate,
                  status: order.status,
                  approvalStatus: order.approvalStatus
                }))}
              />
            ) : (
              <div style={{ marginTop: 20, color: '#888' }}>No previous diet packages found.</div>
            )
          )}
        </div>

      </PageContainer>
      <Footer />
    </>
  );
};

export default PatientDietHistory; 