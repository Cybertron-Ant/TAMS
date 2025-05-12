// import { DataGrid } from '@mui/x-data-grid';
// import React, { useEffect, useState } from 'react';

// const NewHireList: React.FC = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);
//  let daysago = 90;
//   const fetchData = async () => {
//     try {
//       const response = await fetch('${API_URL}/Employees');
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       const jsonData = await response.json();
//       const filteredData = jsonData.filter(employee => {
//         const hiredDate = new Date(employee.dateHired);
//         const today = new Date();
//         const ninetyDaysAgo = new Date();
//         ninetyDaysAgo.setDate(today.getDate() - daysago);
//         return hiredDate <= ninetyDaysAgo;
//       });
//       setData(filteredData);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const columns = [
//     { field: 'id', headerName: 'ID', width: 90 },
//     { field: 'firstName', headerName: 'First Name', width: 150 },
//     { field: 'lastName', headerName: 'Last Name', width: 150 },
//     { field: 'dateHired', headerName: 'Date Hired', width: 150 },
//   ];

//   return (
//     <div style={{ height: 400, width: '100%' }}>
//       <p>New Hires for the Pass {daysago} Days</p>
//       <DataGrid rows={data} columns={columns} />
//     </div>
//   );
// };

// export default NewHireList;
