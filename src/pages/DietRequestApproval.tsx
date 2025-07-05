import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { useNavigate } from 'react-router-dom';
import ButtonWithGradient from '../components/button';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Searchbar from '../components/Searchbar';
import DeleteButton from '../components/DeleteButton';
import ApproveButton from '../components/AcceptButton';
import RejectButton from '../components/RejectButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { dietRequestsApi } from '../services/api';
import type { DietRequest } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/DietRequestApproval.css'

interface DietRequestApprovalProps {
    sidebarCollapsed?: boolean;
    toggleSidebar?: () => void;
}

const DietRequestApproval: React.FC<DietRequestApprovalProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<DietRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load diet requests from API
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const data = await dietRequestsApi.getAll();
        setRequests(data);
      } catch (error) {
        console.error('Failed to load diet requests:', error);
        toast.error('Failed to load diet requests');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleApprove = async (id: string) => {
    try {
      await dietRequestsApi.update(id, { status: 'Diet Order Placed' });
      const updatedRequests = await dietRequestsApi.getAll();
      setRequests(updatedRequests);
      toast.success('Diet request approved successfully!');
    } catch (error) {
      console.error('Failed to approve diet request:', error);
      toast.error('Failed to approve diet request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await dietRequestsApi.update(id, { status: 'Rejected' });
      const updatedRequests = await dietRequestsApi.getAll();
      setRequests(updatedRequests);
      toast.error('Diet request rejected successfully!');
    } catch (error) {
      console.error('Failed to reject diet request:', error);
      toast.error('Failed to reject diet request');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await dietRequestsApi.delete(id);
        const updatedRequests = await dietRequestsApi.getAll();
        setRequests(updatedRequests);
        toast.error('Diet request deleted successfully!');
      } catch (error) {
        console.error('Failed to delete diet request:', error);
        toast.error('Failed to delete diet request');
      }
    }
  };

  const columns = [
    { key: 'serial', header: 'S.No'},
    { key: 'patientId', header: 'Patient ID' },
    { key: 'patientName', header: 'Patient Name' },
    { key: 'age', header: 'Age' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'bed', header: 'Bed' },
    { key: 'ward', header: 'Ward' },
    { key: 'floor', header: 'Floor' },
    { key: 'doctor', header: 'Doctor' },
    { key: 'doctorNotes', header: 'Doctor Notes' },
    { key: 'status', header: 'Status',    
      render: (_: any, row: any) => (
      <span className={`status-badge status-${row.status.toLowerCase().replace(/\s+/g, '-')}`}>
        {row.status}
      </span>
    ) },
    {
      key: 'approval',
      header: 'Approval',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {row.status === 'Pending' && (
            <ApproveButton
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApprove(row.id); }}
              size={13}
            />
          )}
          {row.status === 'Pending' && (
            <RejectButton
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReject(row.id); }}
              size={13}
            />
          )}
          {row.status === 'Diet Order Placed' && <span style={{ color: '#219653', fontWeight: 600, fontSize: 12 }}>Approved</span>}
          {row.status === 'Rejected' && <span style={{ color: '#b71c1c', fontWeight: 600, fontSize: 12 }}>Rejected</span>}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', minWidth: 60 }}>
          {row.status === 'Diet Order Placed' && (
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigate('/dietorderform', {
                  state: {
                    patientId: row.patientId,
                    patientName: row.patientName,
                    age: row.age,
                    contactNumber: row.contactNumber,
                    bed: row.bed,
                    ward: row.ward,
                    floor: row.floor,
                    doctor: row.doctor,
                    doctorNotes: row.doctorNotes
                  }
                });
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              title="View Diet Order"
            >
              <FontAwesomeIcon icon={faEye} style={{ color: '#2196f3', fontSize: 16 }} />
            </button>
          )}
          <DeleteButton 
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(row.id); }}
            size={16}
          />
        </div>
      )
    }
  ];
  // console.log(columns);

  const filteredData = requests.filter(item =>
    Object.values(item).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>
    <PageContainer>
      <SectionHeading 
        title="Diet Request Approval" 
        subtitle="View and manage all diet requests" 
      />
      <div style={{display:'flex',justifyContent:'space-between',alignItems:"center" ,marginBottom: '20px' }}>
        {/* <ButtonWithGradient 
          text="+ Add New Diet Request" 
          onClick={() => navigate('/diet-request')} 
        /> */}
        <Searchbar 
          value={searchTerm} 
          onChange={handleSearchChange} 
          placeholder="Search diet requests..."
        />
      </div>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading diet requests...
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <Table 
            columns={columns} 
            data={filteredData.map((item, index) => ({ ...item, serial: index + 1 }))} 
          />
        </div>
      )}
    </PageContainer>
    <Footer/>
    </>
  );
};

export default DietRequestApproval;
