import axios from 'axios';
import React, { useEffect, useState } from 'react';


function HomepageComp(){

  const [workouts, setWorkouts] = useState([]);


  useEffect(() => {
    const fetchWorkouts = async () => {
      try{
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workouts`)
        const formattedWorkouts = response.data;
        setWorkouts(formattedWorkouts);
      }
      catch(error){
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, []);

  async function addWorkout() {
    try{
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-workout`,{
        workout_name: "Late Night 10mile",
        duration: 3600,
        distance: 10.1,
        heart_rate: 165
      })
      console.log(response.data);
    }
    catch(err){
      console.log("Can't add workout")
    }
  }

  return (
    <>

      <div className='app-container'>
        <header className='header-container'>
          <nav className='navbar'>
            Hello World
          </nav>
        </header>
        <div>
          <button></button>
          <button onClick={addWorkout}>Add Workout</button>
        </div>
      </div>
    </>
  )
}






export default HomepageComp;