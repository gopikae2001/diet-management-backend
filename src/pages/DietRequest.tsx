import React, { useEffect, useState } from 'react';
import '../styles/DietRequest.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { useNavigate } from 'react-router-dom';
import FormInputs from '../components/Input';
import ButtonWithGradient from '../components/button';
import AddressInput from '../components/Addressinput';
import { dietRequestsApi } from '../services/api';
import type { DietRequest } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DietRequestManagementProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const DietRequestManagement: React.FC<DietRequestManagementProps> = ({ sidebarCollapsed, toggleSidebar }) => {
    const [requests, setRequests] = useState<DietRequest[]>([]);
    const navigate = useNavigate();
    const [newRequest, setNewRequest] = useState({
        patientId: '',
        patientName: '',
        age: '',
        contactNumber: '',
        bed: '',
        ward: '',
        floor: '',
        doctor: '',
        doctorNotes: '',
        status: 'Pending',
        approval: 'Pending',
    });
    const [editId, setEditId] = useState<string | null>(null);
    const [editRequest, setEditRequest] = useState<typeof newRequest | null>(null);
    const [contactError, setContactError] = useState('');
    const [patientIdError, setPatientIdError] = useState('');
    const [patientNameError, setPatientNameError] = useState('');

    useEffect(() => {
        // Load diet requests from API
        const loadRequests = async () => {
            try {
                const data = await dietRequestsApi.getAll();
                setRequests(data);
            } catch (error) {
                console.error('Failed to load diet requests:', error);
                toast.error('Failed to load diet requests');
            }
        };

        loadRequests();
    }, []);

    const handleApprove = async (id: string) => {
        const request = requests.find(r => r.id === id);
        if (request) {
            try {
                // Update status to approved
                await dietRequestsApi.update(id, { status: 'Diet Order Placed' as const });
                
                // Refresh requests from API
                const updatedRequests = await dietRequestsApi.getAll();
                setRequests(updatedRequests);

                // Navigate to diet order page with patient details
                navigate('/dietorder', {
                    state: {
                        patientId: request.patientId,
                        patientName: request.patientName,
                        age: request.age,
                        contactNumber: request.contactNumber,
                        bed: request.bed,
                        ward: request.ward,
                        floor: request.floor,
                        doctor: request.doctor,
                        doctorNotes: request.doctorNotes
                    }
                });
                
                toast.success('Diet request approved successfully!');
            } catch (error) {
                console.error('Failed to approve diet request:', error);
                toast.error('Failed to approve diet request');
            }
        }
    };

    const handleView = (req: DietRequest) => {
        // Could show a modal or navigate to a details page
        alert(`Patient: ${req.patientName}\nDoctor: ${req.doctor}\nStatus: ${req.status}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Handle patient name - only allow letters and spaces
        if (name === 'patientName') {
            // Only allow letters and spaces
            const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
            
            if (editId && editRequest) {
                setEditRequest(prev => ({ ...(prev || {}), [name]: lettersOnly } as any));
            } else {
                setNewRequest(prev => ({ ...prev, [name]: lettersOnly }));
            }
            return;
        }
        
        // Special handling for contact number to ensure it's exactly 10 digits
        if (name === 'contactNumber') {
            // Only allow numbers and limit to 10 digits
            const numbersOnly = value.replace(/\D/g, '');
            if (numbersOnly.length > 10) return; // Don't update if more than 10 digits
            
            // Validate contact number length
            if (numbersOnly.length > 0 && numbersOnly.length !== 10) {
                setContactError('Contact number must be 10 digits');
            } else {
                setContactError('');
            }
            
            if (editId && editRequest) {
                setEditRequest({ ...editRequest, [name]: numbersOnly });
            } else {
                setNewRequest(prev => ({ ...prev, [name]: numbersOnly }));
            }
            return;
        }
        
        // Handle other fields normally
        if (editId && editRequest) {
            setEditRequest({ ...editRequest, [name]: value });
        } else {
            setNewRequest(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset previous errors
        setContactError('');
        setPatientIdError('');
        setPatientNameError('');
        
        let hasError = false;
        
        // Validate Patient ID
        if (!newRequest.patientId.trim()) {
            setPatientIdError('Patient ID is required');
            hasError = true;
        }
        
        // Validate Patient Name
        if (!newRequest.patientName.trim()) {
            setPatientNameError('Patient Name is required');
            hasError = true;
        }
        
        // Validate Contact Number
        if (newRequest.contactNumber.length !== 10) {
            setContactError('Contact number must be 10 digits');
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            const newReq = {
                patientId: newRequest.patientId,
                patientName: newRequest.patientName,
                age: newRequest.age,
                contactNumber: newRequest.contactNumber,
                bed: newRequest.bed,
                ward: newRequest.ward,
                floor: newRequest.floor,
                doctor: newRequest.doctor,
                doctorNotes: newRequest.doctorNotes,
                status: newRequest.status as DietRequest['status'],
            };
            
            await dietRequestsApi.create(newReq);
            
            // Refresh requests from API
            const updatedRequests = await dietRequestsApi.getAll();
            setRequests(updatedRequests);
            
            setNewRequest({ patientId: '', patientName: '', age: '', contactNumber: '', bed: '', ward: '', floor: '', doctor: '', doctorNotes: '', status: 'Pending', approval: 'Pending' });
            
            toast.success('Diet request created successfully!');
            
            // Navigate to diet request approval page after successful submission
            navigate('/dietrequestapproval');
        } catch (error) {
            console.error('Failed to create diet request:', error);
            toast.error('Failed to create diet request');
        }
    };

    const handleEdit = (id: string) => {
        const req = requests.find(r => r.id === id);
        if (req) {
            setEditId(id);
            setEditRequest({ ...req, approval: req.status === 'Diet Order Placed' ? 'Approved' : req.status });
        }
    };
    const handleEditSave = async () => {
        if (!editId || !editRequest) return;
        
        try {
            await dietRequestsApi.update(editId, {
                ...editRequest,
                status: editRequest.status as DietRequest['status']
            });
            
            // Refresh requests from API
            const updatedRequests = await dietRequestsApi.getAll();
            setRequests(updatedRequests);
            
            setEditId(null);
            setEditRequest(null);
            toast.success('Diet request updated successfully!');
        } catch (error) {
            console.error('Failed to update diet request:', error);
            toast.error('Failed to update diet request');
        }
    };
    const handleEditCancel = () => {
        setEditId(null);
        setEditRequest(null);
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this request?')) return;
        
        try {
            await dietRequestsApi.delete(id);
            
            // Refresh requests from API
            const updatedRequests = await dietRequestsApi.getAll();
            setRequests(updatedRequests);
            
            toast.success('Diet request deleted successfully!');
        } catch (error) {
            console.error('Failed to delete diet request:', error);
            toast.error('Failed to delete diet request');
        }
    };
    
    const handleReject = async (id: string) => {
        try {
            await dietRequestsApi.update(id, { status: 'Rejected' as 'Rejected' });
            
            // Refresh requests from API
            const updatedRequests = await dietRequestsApi.getAll();
            setRequests(updatedRequests);
            
            toast.success('Diet request rejected successfully!');
        } catch (error) {
            console.error('Failed to reject diet request:', error);
            toast.error('Failed to reject diet request');
        }
    };

    return (
        <>
            <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>
            <PageContainer>
                        <SectionHeading title="Diet Request Management" subtitle="Manage and approve diet requests from hospital staff" />
                    <div className="form-section3">
                        {/* <div className="section-header">Add Diet Request</div> */}
                        <form className="form" onSubmit={handleAddRequest} style={{ marginBottom: 0 }}>

                            {/* Row 1: Patient ID and Name */}
                            <div className="form-row1" >
                                <div className="form-group1" >
                                    <FormInputs
                                        label="Patient ID"
                                        name="patientId"
                                        value={newRequest.patientId}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewRequest({ ...newRequest, patientId: e.target.value })
                                        }
                                        placeholder="Enter patient ID"
                                    />
                                    {patientIdError && (
                                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                            {patientIdError}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group1" style={{ flex: 1 }}>
                                    <FormInputs
                                        label="Patient Name"
                                        name="patientName"
                                        value={newRequest.patientName}
                                        onChange={handleInputChange}
                                        placeholder="Enter patient name"
                                    />
                                    {patientNameError && (
                                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                            {patientNameError}
                                        </div>
                                    )}
                                </div>
                            </div>



                            {/* Row 2: Age and Contact Number */}
                            <div className="form-row1">
                                <div className="form-group1">
                                    <FormInputs
                                        label="Age"
                                        name="age"
                                        type="text"
                                        value={newRequest.age}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            // Only allow numbers
                                            const value = e.target.value.replace(/\D/g, '');
                                            setNewRequest(prev => ({ ...prev, age: value }));
                                        }}
                                        onKeyPress={(e) => {
                                            // Prevent non-numeric characters
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        placeholder="Enter age"
                                    />
                                </div>
                                <div className="form-group1">
                                    <FormInputs
                                        label="Contact Number"
                                        name="contactNumber"
                                        type="tel"
                                        value={newRequest.contactNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter 10-digit number"
                                        maxLength={10}
                                        pattern="\d{10}"
                                        title="Please enter exactly 10 digits"
                                    />
                                    {contactError && (
                                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                            {contactError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Bed and Ward */}
                            <div className="form-row1">
                                <div className="form-group1">
                                    <FormInputs
                                        label="Bed"
                                        name="bed"
                                        value={newRequest.bed}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewRequest({ ...newRequest, bed: e.target.value })
                                        }
                                        placeholder="Enter bed number"
                                    />
                                </div>
                                <div className="form-group1">
                                    <FormInputs
                                        label="Ward"
                                        name="ward"
                                        value={newRequest.ward}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewRequest({ ...newRequest, ward: e.target.value })
                                        }
                                        placeholder="Enter ward"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Floor and Doctor */}
                            <div className="form-row1">
                                <div className="form-group1">
                                    <FormInputs
                                        label="Floor"
                                        name="floor"
                                        value={newRequest.floor}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewRequest({ ...newRequest, floor: e.target.value })
                                        }
                                        placeholder="Enter floor"
                                    />
                                </div>
                                <div className="form-group1">
                                    <FormInputs
                                        label="Consulting Doctor"
                                        name="doctor"
                                        value={newRequest.doctor}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setNewRequest({ ...newRequest, doctor: e.target.value })
                                        }
                                        placeholder="Enter doctor name"
                                    />
                                </div>
                            </div>

                            {/* Row 5: Doctor Notes (full width) */}
                            <div className="form-row1">
                                <div className="form-group1" style={{ flex: '0 0 61%' }}>
                                    <AddressInput
                                        name="doctorNotes"
                                        label="Doctor Notes"
                                        value={newRequest.doctorNotes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setNewRequest({ ...newRequest, doctorNotes: e.target.value })
                                        }
                                        placeholder="Enter doctor notes"
                                    />
                                </div>
                            </div>
                            {/* <div className="form-row" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
              <div className="form-group" style={{ minWidth: 600, flex: 1 }}>
                <FormInputs
                label="Patient ID"
                name="patientId"
                value={newRequest.patientId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
              </div>
              <div className="form-group" style={{ minWidth: 00, flex: 1 }}>
                <FormInputs
                label="Patient Name"
                name="patientName"
                value={newRequest.patientName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                placeholder="Enter patient name"
              />
              </div>
              <div className="form-group" style={{ minWidth: 500, flex: 1 }}>
                <FormInputs
                label="Age"
                name="age"
                value={newRequest.age}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, age: e.target.value })}
                placeholder="Enter age"
              />
              </div>
              <div className="form-group" style={{ minWidth: 500, flex: 1 }}>
                <FormInputs
                label="Bed"
                name="bed"
                value={newRequest.bed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, bed: e.target.value })}
                placeholder="Enter bed"
              />
              </div>
              <div className="form-group" style={{ minWidth: 500, flex: 1 }}>
                <FormInputs
                label="Ward"
                name="ward"
                value={newRequest.ward}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, ward: e.target.value })}
                placeholder="Enter ward"
              />
              </div>
              <div className="form-group" style={{ minWidth: 500, flex: 1 }}>
                <FormInputs
                label="Floor"
                name="floor"
                value={newRequest.floor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, floor: e.target.value })}
                placeholder="Enter floor"
              />
              </div>
              <div className="form-group" style={{ minWidth: 500, flex: 1 }}>
                <FormInputs
                label="Consulting Doctor"
                name="doctor"
                value={newRequest.doctor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, doctor: e.target.value })}
                placeholder="Enter doctor name"
              />
              </div>
              <div className="form-group" style={{ minWidth: 500, flex: 1 }}>
                <FormInputs
                label="Doctor Notes"
                name="doctorNotes"
                value={newRequest.doctorNotes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, doctorNotes: e.target.value })}
                placeholder="Enter doctor notes"
              />
              </div>
            </div> */}
                            <div className="btn-text">
                                <ButtonWithGradient type="submit">Add Diet Request</ButtonWithGradient>
                            </div>
                        </form>
                    </div>
            </PageContainer>
            <Footer />
        </>
    );
};

export default DietRequestManagement; 