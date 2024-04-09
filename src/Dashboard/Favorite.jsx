import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import '../Dashboard/CSS/card.css';

function Favorite() {
  const [storyData, setStoryData] = useState([]);
  const [favoriteSum, setFavoriteSum] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Query 'RB' from the 'users' collection
        const userQuery = query(collection(db, 'users'), where('favorite', 'array-contains', 'RB'));
        const userQuerySnapshot = await getDocs(userQuery);

        // Calculate the sum of favorite results
        let sum = 0;
        userQuerySnapshot.forEach(doc => {
          const userData = doc.data();
          const favoritesArray = userData.favorite; // Replace 'favorite' with your actual array field name
          sum += favoritesArray.filter(fav => fav === 'RB').length;
        });
        setFavoriteSum(sum);

        // Query 'storys' collection based on 'RB' from users
        const storyQuery = query(collection(db, 'storys'), where('id', '==', 'RB'));
        const storyQuerySnapshot = await getDocs(storyQuery);
        const storyData = storyQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStoryData(storyData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='card-container'>
      <div className='card-ef'>
        <div className='main-title'>
          <h2>Story Data for RB</h2>
          <ul>
            {storyData.map(story => (
              <li key={story.id}>
                <strong>Title:</strong> {story.title}
                <br />
                {/* Add more fields as needed */}
              </li>
            ))}
          </ul>
          <p>Sum of 'RB' favorites: {favoriteSum}</p>
        </div>
      </div>
    </div>
  );
}

export default Favorite;