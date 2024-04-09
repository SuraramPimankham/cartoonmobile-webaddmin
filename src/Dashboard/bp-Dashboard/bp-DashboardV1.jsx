import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const IncomeDisplay = () => {
    const [incomeData, setIncomeData] = useState([]);

    useEffect(() => {
        const fetchIncomeData = async () => {
            try {
                const incomeCollectionRef = collection(db, 'Income');
                const snapshot = await getDocs(incomeCollectionRef);
                const dataArr = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    dataArr.push(data);
                });
                setIncomeData(dataArr);
            } catch (error) {
                console.error('Error fetching income data:', error);
            }
        };
        fetchIncomeData();
    }, []);

    // Calculate income totals for each storyId
    const incomeTotals = incomeData.reduce((acc, curr) => {
        if (acc[curr.storyId]) {
            acc[curr.storyId].totalIncome += curr.amount;
            acc[curr.storyId].coin = curr.coin;
            acc[curr.storyId].title = curr.title;
        } else {
            acc[curr.storyId] = {
                totalIncome: curr.amount,
                coin: curr.coin,
                title: curr.title
            };
        }
        return acc;
    }, {});
    // Log the data
    console.log('Income Totals:', incomeTotals);

    // Transform incomeTotals object into an array for Recharts
    const chartData = Object.keys(incomeTotals).map(storyId => ({
        storyId,
        totalIncome: incomeTotals[storyId].totalIncome,
        coin: incomeTotals[storyId].coin,
        title: incomeTotals[storyId].title
    }));

    return (
        <div>
            <h1>Income Data</h1>
            <div style={{ width: '100%', height: 400 }}>
                <BarChart width={800} height={400} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="storyId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="coin" fill="#8884d8" />
                </BarChart>
            </div>
        </div>
    );
};

export default IncomeDisplay;
