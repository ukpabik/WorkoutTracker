import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FootComp from './FootComp';
import Navbar from './Navbar';

function HomepageComp() {

  
  const [workouts, setWorkouts] = useState([]);
  const [reverse, setReverse] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    workout_name: '',
    duration: '',
    distance: '',
    heart_rate: ''
  });
  const [filters, setFilters] = useState({
    workout_name: '',
    min_duration: '',
    max_duration: '',
    min_distance: '',
    max_distance: '',
    heart_rate: '',
    start_date: '',
    end_date: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const toggleFilterBar = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  

  // Function that fetches the workouts based on provided filters
  const fetchWorkouts = async () => {
    try {

      // Uses url search params api to turn filters into a search query
      const query = new URLSearchParams(filters).toString();
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workouts?${query}`);
      
      setWorkouts(response.data);

    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };



  // Handling change of inputs in workout submission form
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setWorkoutForm({
      ...workoutForm,
      [name]: value
    });
  };

  // Handling change of filters
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Handling checkbox
  const handleCheckbox = () => {
    setReverse(!reverse);
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
    const formattedDate = date.toLocaleString('en-US', options).split(',');
    return formattedDate[1] + " | " + formattedDate[0];
  }


  useEffect(() => {
    fetchWorkouts();
  }, [filters]);

  


  // Function to add a workout (used with add workout form)
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Send the new workout to the backend
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-workout`, {
        workout_name: workoutForm.workout_name,
        duration: workoutForm.duration * 60, 
        distance: workoutForm.distance,
        heart_rate: workoutForm.heart_rate
      });
      
  
      // Reset form
      setWorkoutForm({
        workout_name: '',
        duration: '',
        distance: '',
        heart_rate: ''
      });

      fetchWorkouts();
  
    } catch (err) {
      console.error("Error adding workout:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className='app-container'>

        <div className='body-container'>
          <div className='filter-container'>
            <div className='filter-bar' onClick={toggleFilterBar}>
              Filter
            </div>
            {isFilterOpen && (
                <div className='filter-dropdown'>
                  <input
                    name='workout_name'
                    type='text'
                    value={filters.workout_name}
                    onChange={handleFilterChange}
                    placeholder="Workout Name"
                  />

                  <input
                    name='min_duration'
                    type='text'
                    value={filters.min_duration}
                    onChange={handleFilterChange}
                    placeholder="Min Duration"
                  />

                  <input
                    name='max_duration'
                    type='text'
                    value={filters.max_duration}
                    onChange={handleFilterChange}
                    placeholder="Max Duration"
                  />

                  <input
                    name='min_distance'
                    type='text'
                    value={filters.min_distance}
                    onChange={handleFilterChange}
                    placeholder="Min Distance"
                  />

                  <input
                    name='max_distance'
                    type='text'
                    value={filters.max_distance}
                    onChange={handleFilterChange}
                    placeholder="Max Distance"
                  />

                  <input
                    name='heart_rate'
                    type='text'
                    value={filters.heart_rate}
                    onChange={handleFilterChange}
                    placeholder="Heart Rate"
                  />

                  <input
                    name='start_date'
                    type='date'
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />

                  <input
                    name='end_date'
                    type='date'
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                  <div className='sort-box'>
                    <label className='sort-label' htmlFor="Sort By Date">{reverse ? "Date ↓" : "Date ↑"}</label>
                    <input 
                      type="checkbox"
                      name='Sort By Date'
                      onChange={handleCheckbox}
                      className='checkbox-input'
                    />
                  </div>
                </div>
              )}
          </div>


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
                  placeholder='Duration (in minutes)'
                  type="text"
                  value={workoutForm.duration}
                  onChange={handleInputChange}
                  required
                />

                <label htmlFor="distance">Distance</label>
                <input
                  name='distance'
                  id="distance"
                  placeholder='Distance (in miles)'
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
              (reverse ? workouts.slice().reverse() : workouts).map((workout, index) => (
                <div key={index} className='workout-item'>
                  <div className='workout-details'>
                    <span>{workout.workout_name}</span>
                    <span title='Duration'><img className='icons' src="time-icon.svg" alt="duration icon" /> {Math.round(workout.duration / 60)} min</span>
                    <span title='Distance'><img className='icons' src="distance-icon.svg" alt="distance icon" /> {workout.distance} miles</span>
                    <span title='Heart Rate'><img className='icons' src="heart-icon.svg" alt="heart icon" /> {workout.heart_rate} bpm</span>
                    <span title='Time' style={{
                      fontSize: '0.8rem'
                    }}>Time: {formatDate(workout.date_time)}</span>
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