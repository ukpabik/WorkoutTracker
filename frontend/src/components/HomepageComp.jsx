import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FootComp from './FootComp';
import Navbar from './Navbar';

function HomepageComp(){

  const [workouts, setWorkouts] = useState([]);
  const [workoutForm, setWorkoutForm] = useState({
    workout_name: '',
    duration: '',
    distance: '',
    heart_rate: ''
  });



  // Handling change of inputs in workout submission form
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setWorkoutForm({
      ...workoutForm,
      [name]: value
    });
  };




  // Function to format the dates out of iso form
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleString('en-US', options);
  }


  // Fetch workouts after page is rendered
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


  // Function to add a workout (used with add workout form)
  const handleSubmit = async (event) => {
    event.preventDefault();

    try{
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-workout`, workoutForm);
      console.log('Workout added:', response.data);

      // Reset form
      setWorkoutForm({
        workout_name: '',
        duration: '',
        distance: '',
        heart_rate: ''
      })
    }
    catch(err){
      console.log("Can't add workout")
    }
  }

  return (
    <>
      <Navbar />
      <div className='app-container'>
        
        <div className='body-container'>
          <div className='inputs-container'>
            <div className='text-box'>
            <form method='post' className="add-workout-form" onSubmit={handleSubmit}>
              <label htmlFor="workout-name">Workout Name</label>
              <input
                name='workout_name'
                id="workout_name"
                placeholder='Workout Name'
                type="text"
                value={workoutForm.workout_name}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="duration">Duration</label>
              <input
                name='duration'
                id="duration"
                placeholder='Duration (in seconds)'
                type="text"
                value={workoutForm.duration}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="distance">Distance</label>
              <input
                name='distance'
                id="distance"
                placeholder='Distance'
                type="text"
                value={workoutForm.distance}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="heart-rate">Heart Rate</label>
              <input
                name='heart_rate'
                id="heart_rate"
                placeholder='Heart Rate'
                type="text"
                value={workoutForm.heart_rate}
                onChange={handleInputChange}
                required
              />

              <button className='add-workout-button' type='submit'>Add Workout</button>
            </form>
              
            </div>
            
          </div>
          
          <div className='workouts-container'>
            <p className='workouts-container-title'>Workouts</p>
            {workouts.length > 0 ? (
              workouts.map((workout, index) => (
                <div key={index} className='workout-item'>
                  <div className='workout-details'>
                    <span>{workout.workout_name}</span> 
                    <span title='Duration'><img className='icons' src="time-icon.svg" alt="duration icon" /> {workout.duration}s</span>
                    <span title='Distance'><img className='icons' src="distance-icon.svg" alt="distance icon" /> {workout.distance} miles</span>
                    <span title='Heart Rate'><img className='icons' src="heart-icon.svg" alt="heart icon" /> {workout.heart_rate} bpm</span>
                    <span title='Time'>Time: {formatDate(workout.date_time)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No workouts available</p>
            )}
            
          </div>
            
        </div>
      </div>
      <FootComp />
    </>
  )
}






export default HomepageComp;