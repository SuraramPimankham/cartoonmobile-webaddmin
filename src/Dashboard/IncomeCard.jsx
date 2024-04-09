import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';



const Income = () => {
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
    console.log('income', incomeTotals);

    // หาเรื่องที่มี coin มากที่สุด
    let maxCoinStory = null;
    let maxCoin = -Infinity;

    for (const storyId in incomeTotals) {
        if (incomeTotals[storyId].coin > maxCoin) {
            maxCoin = incomeTotals[storyId].coin;
            maxCoinStory = { ...incomeTotals[storyId], storyId: storyId };
        }
    }

    console.log("Story with the highest coin:", maxCoinStory);

    // หาเรื่องที่มี coin น้อยที่สุด
    let minCoinStory = null;
    let minCoin = Infinity;

    for (const storyId in incomeTotals) {
        if (incomeTotals[storyId].coin < minCoin) {
            minCoin = incomeTotals[storyId].coin;
            minCoinStory = { ...incomeTotals[storyId], storyId: storyId };
        }
    }

    console.log("minCoinStory :", minCoinStory);
    console.log("maxCoinStory :", maxCoinStory);



    // Convert incomeTotals to an array
    const sortedIncome = Object.entries(incomeTotals).sort((a, b) => b[1].totalIncome - a[1].totalIncome);

    return (
        <div className='card-container-incom'>
            < div className='card-ef-income'>
                <div className='main-title-income'>

                    <><p>ข้อมูลรายได้</p></>

                    <table>
                        <thead>
                            <tr>
                                <th>รหัสเรื่อง</th>
                                <th>ชื่อเรื่อง</th>
                                <th>รายได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedIncome.map(([storyId, { coin, title }], index) => (
                                <tr key={index}>
                                    <td>{storyId}</td>
                                    <td>{title}</td>
                                    <td>{coin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

            </div>


            {/* Card for maximum coin story */}
            <div className='card-container-incom' >
                <div className='card-ef-income' >
                    <div className='main-title-income'>
                        <p>การ์ตูนที่มีรายได้สูงที่สุด</p>
                        <div  >
                            <table >
                                {maxCoinStory && (
                                    <div>
                                        <p>รหัสเรื่อง: {maxCoinStory.storyId}</p>
                                        <p>ชื่อเรื่อง: {maxCoinStory.title}</p>
                                        <p>รายได้: {maxCoinStory.coin}</p>
                                    </div>

                                )}

                            </table>
                        </div>
                    </div>
                </div>

            </div>

            {/* Card for minimum coin story */}
            <div className='card-container-incom' >
                <div className='card-ef-income' >
                    <div className='main-title-income' >
                        <p>การ์ตูนที่มีรายได้น้อยที่สุด</p>
                        <div >
                            <table>
                                {minCoinStory && (
                                    <div>
                                        <p>รหัสเรื่อง: {minCoinStory.storyId}</p>
                                        <p>ชื่อเรื่อง: {minCoinStory.title}</p>
                                        <p>รายได้: {minCoinStory.coin}</p>
                                    </div>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

            </div>




        </div>




    );
};

export default Income;