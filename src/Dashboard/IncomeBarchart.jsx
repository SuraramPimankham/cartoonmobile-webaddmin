import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';
import '../Dashboard/CSS/barchart.css';

const IncomeBarchart = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const collectionRef = collection(db, 'users');
            const querySnapshot = await getDocs(collectionRef);

            const data = [];
            querySnapshot.forEach(doc => {
                const docData = doc.data();
                const { score_action, score_comedy, score_fantasy, score_horror, score_romance } = docData;
                
                data.push({
                    userId: doc.id,
                    score_action: parseFloat(score_action),
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

    if (chartData.length === 0) {
        return <div>Loading...</div>; // Render a loading state when data is being fetched
    }

    return (
        <div className="bar-score-container">
            <div className="bar-title">
                <p>Number of Users and Scores</p>
                <BarChart width={800} height={400} data={chartData} title="Users and Scores">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="users" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score_action" fill="#E46C88" name="Action Score" />
                    <Bar dataKey="score_comedy" fill="#F893B5" name="Comedy Score" />
                    <Bar dataKey="score_fantasy" fill="#FFC54D" name="Fantasy Score" />
                    <Bar dataKey="score_horror" fill="#B85DAD" name="Horror Score" />
                    <Bar dataKey="score_romance" fill="#63B7AF" name="Romance Score" />
                </BarChart>
            </div>
        </div>
    );
};


export default IncomeBarchart;


