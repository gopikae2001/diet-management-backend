import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ButtonWithGradient from '../components/button';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Searchbar from '../components/Searchbar';
import Table from '../components/Table';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';


interface DietPackage {
  id: string;
  name: string;
  type: string;
  totalRate: number;
  totalNutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  breakfast?: Array<{
    foodItemName: string;
    quantity: number;
    unit: string;
  }>;
  brunch?: Array<{
    foodItemName: string;
    quantity: number;
    unit: string;
  }>;
  lunch?: Array<{
    foodItemName: string;
    quantity: number;
    unit: string;
  }>;
  evening?: Array<{
    foodItemName: string;
    quantity: number;
    unit: string;
  }>;
  dinner?: Array<{
    foodItemName: string;
    quantity: number;
    unit: string;
  }>;
}

interface DietPackageListProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const DietPackageList: React.FC<DietPackageListProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [dietPackages, setDietPackages] = useState<DietPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Load diet packages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dietPackages');
      if (saved) {
        setDietPackages(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load diet packages:', error);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (pkg: DietPackage) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/dietpackage/${pkg.id}`, { state: { packageData: pkg } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      // Create a new array without the deleted item
      const updatedPackages = dietPackages.filter(pkg => pkg.id !== id);
      // Update localStorage
      localStorage.setItem('dietPackages', JSON.stringify(updatedPackages));
      // Update state
      setDietPackages(updatedPackages);
      // Show success message (only once)
      toast.error('Diet package deleted successfully!');
      // No navigation after delete
      // Force a re-render by toggling the search term
      setSearchTerm(prev => prev + ' ');
      setTimeout(() => setSearchTerm(prev => prev.trimEnd()), 90);
    }
  };

  const formatMealItems = (items: Array<{foodItemName: string, quantity: number, unit: string}> = []) => {
    if (!items || items.length === 0) {
      return 'No items added';
    }
    return <span style={{ fontWeight: 'bold' }}>
      {items.map(item => `${item.foodItemName} - ${item.quantity} ${item.unit}`).join(', ')}
    </span>;
  };

  // Filter the diet packages based on search term
  // const filteredData = dietPackages.filter(pkg =>
  //   searchTerm === '' || 
  //   pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   pkg.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   pkg.totalRate.toString().includes(searchTerm)
  // );
  const filteredData = dietPackages.filter(item =>
    Object.values(item).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Add a serial number to each row based on its position in filteredData
  const tableData = filteredData.map((item, index) => ({
    ...item,
    _sno: index + 1  // This will be our serial number
  }));

  const columns = [
    { 
      key: '_sno', 
      header: 'S.No',
      render: (value: any) => value, // Simple render function for the serial number
    },
    { key: 'name', header: 'Package Name' },
    { key: 'type', header: 'Diet Type' },
    { 
      key: 'breakfast', 
      header: 'Breakfast',
      render: (value: any) => formatMealItems(value)
    },
    { 
      key: 'brunch', 
      header: 'Brunch',
      render: (value: any) => formatMealItems(value)
    },
    { 
      key: 'lunch', 
      header: 'Lunch',
      render: (value: any) => formatMealItems(value)
    },
    { 
      key: 'evening', 
      header: 'Evening',
      render: (value: any) => formatMealItems(value)
    },
    { 
      key: 'dinner', 
      header: 'Dinner',
      render: (value: any) => formatMealItems(value)
    },
    { 
      key: 'totalRate', 
      header: 'Total Rate',
      render: (value: any) => `₹${Number(value).toFixed(2)}`
    },
    { 
      key: 'totalNutrition', 
      header: 'Calories',
      render: (value: any) => value?.calories?.toFixed(1) || 'N/A'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <a onClick={(e: React.MouseEvent) => handleEdit(row as DietPackage)(e)}>
            <EditButton onClick={() => navigate(`/dietpackage/${row.id}`)}/></a>
          <a onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(row.id);
          }}><DeleteButton /></a>
        </div>
      )
    }
  ];

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>
      <PageContainer>
        <SectionHeading 
          title="Diet Package List" 
          subtitle="View and manage all diet packages" 

        />
        
        <div style={{display:'flex',justifyContent:'space-between',alignItems:"center" ,marginBottom: '20px' }}>
            <ButtonWithGradient 
              text="+ Add New Diet Package" 
              onClick={() => navigate('/dietpackage')} 
            />
          <Searchbar value={searchTerm} onChange={handleSearchChange} placeholder="Search diet packages..." />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <Table 
            columns={columns} 
            data={tableData}
            key={`table-${tableData.length}`} // Force re-render when data changes
          />
        </div>
      </PageContainer>
      <Footer/>
    </>
  );
};

export default DietPackageList;