import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../Dashboard/CSS/LineChart.css'

const LiChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const collectionRef = collection(db, 'users'); // Replace 'your_collection_name' with your actual collection name
      const querySnapshot = await getDocs(collectionRef);

      const data = [];
      querySnapshot.forEach(doc => {
        // Get data from the document
        const docData = doc.data();
        const { timestamp, score_action, score_comedy, score_fantasy, score_horror, score_romance } = docData;
        
        // Push data into the array in the format required by Recharts
        data.push({
          timestamp,
          score_action: parseFloat(score_action), // Convert to number if needed
          score_comedy: parseFloat(score_comedy),
          score_fantasy: parseFloat(score_fantasy),
          score_horror: parseFloat(score_horror),
          score_romance: parseFloat(score_romance),
        });
      });

      setChartData(data);
    };

    fetchData();
  }, []);

  return (
    <div className='line-container'>
      <div className='line-title' >
        <div className='line-up'>
      <p>แนวการ์ตูนยอดนิยม</p>
      <LineChart width={800} height={400} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score_action" stroke="#FC89EB"  />
        <Line type="monotone" dataKey="score_comedy" stroke="#E46C88" />
        <Line type="monotone" dataKey="score_fantasy" stroke="#FAA86F" />
        <Line type="monotone" dataKey="score_horror" stroke="#5677fc" />
        <Line type="monotone" dataKey="score_romance" stroke="#FE439D" />
        
      </LineChart>
      </div>
      </div>
      </div>
    // 
  );
};

export default LiChart;




// function LiChart (){
// const [cartoonsData, setCartoonsData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const collectionRef = collection(db, 'users');
//       const querySnapshot = await getDocs(collectionRef);

//       const cartoons = [];
//       querySnapshot.forEach(doc => {
//         // Get specific fields from the document
//         const { id, title, score_action, score_comedy, score_fantasy, score_horror, score_romance } = doc.data();
//         cartoons.push({ id, title, score_action, score_comedy, score_fantasy, score_horror, score_romance });
//       });

//       setCartoonsData(cartoons);
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h1>Cartoons Data:</h1>
//       <ul>
//         {cartoonsData.map(cartoon => (
//           <div key={cartoon.id}>
//             Title: {cartoon.title} score_action: {cartoon.score_action}| |score_comedy: {cartoon.score_comedy}
//             | |score_comedy: {cartoon.score_fantasy}| |score_comedy: {cartoon.score_horror}| |score_comedy: {cartoon.score_romance}
//           </div>
//         ))}
//       </ul>
//     </div>

    

//   );

//         }
// export default LiChart
