
// import React, { useState } from 'react';
// import Searchbar from '../components/Searchbar';
// import 'bootstrap/dist/css/bootstrap.min.css';

// interface Data {
//   id: number;
//   name: string;
//   email: string;
// }

// const sampleData: Data[] = [
//   { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
//   { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
//   { id: 2, name: 'cob Smith', email: 'bob@example.com' },
//   { id: 2, name: 'dob Smith', email: 'bob@example.com' },
//   { id: 2, name: 'eob Smith', email: 'bob@example.com' },
//   { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
// ];

// const Table: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const filteredData = sampleData.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className='container w-50 p-3'>
//       <Searchbar value={searchTerm} onChange={handleSearchChange} />

//       <table className='table table-resonsive table-striped'>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredData.map((row) => (
//             <tr key={row.id}>
//               <td>{row.name}</td>
//               <td>{row.email}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Table;



import React from 'react';
import Table from '../components/Table';



const columns = [
  { key: 'id', header: 'S.No' },
  { key: 'name', header: 'Name' },
  { key: 'test', header: 'Test' },
  { key: 'test2', header: 'Test2' },
  { key: 'test5', header: 'Test5' },
  { key: 'test6', header: 'Test6' },
  { key: 'carbs', header: 'Carbs' },
  { key: 'fat', header: 'Fat' },
  { key: 'price', header: 'Price' },
  { key: 'unit', header: 'Unit' },
  { key: 'quantity', header: 'Quantity' }
];

const data = [
  { id: 1, name: 'Apple', test: 'Fruit', test2: 'Fruits', test5: 95, test6: 0.5, carbs: 25, fat: 0.3, price: '₹30', unit: 'piece', quantity: 1 },
  { id: 2, name: 'Chicken Breast', test: 'Protein', test2: 'Meat', test5: 165, test6: 31, carbs: 0, fat: 3.6, price: '₹200', unit: '100g', quantity: 1 },
  { id: 3, name: 'Brown Rice', test: 'Grain', test2: 'Grains', test5: 112, test6: 2.6, carbs: 23.5, fat: 0.9, price: '₹50', unit: 'cup', quantity: 1 },
  { id: 4, name: 'Broccoli', test: 'Vegetable', test2: 'Vegetables', test5: 55, test6: 2.8, carbs: 11, fat: 0.6, price: '₹40', unit: 'piece', quantity: 1 },
  { id: 5, name: 'Egg', test: 'Protein', test2: 'Dairy', test5: 78, test6: 6.3, carbs: 0.6, fat: 5.3, price: '₹10', unit: 'piece', quantity: 1 },
  { id: 6, name: 'Egg', test: 'Protein', test2: 'Dairy', test5: 78, test6: 6.3, carbs: 0.6, fat: 5.3, price: '₹10', unit: 'piece', quantity: 1 }
];

const Itemtable: React.FC = () => {
  return (
    <div>
      <Table columns={columns} data={data} />
    </div>
    
    
  );
};

export default Itemtable;

