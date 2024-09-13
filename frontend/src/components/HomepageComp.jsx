import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FootComp from './FootComp';
import Navbar from './Navbar';

function HomepageComp() {


  const [workouts, setWorkouts] = useState([]);
  const [reverse, setReverse] = useState(false);
  const [timeFrame, setTimeFrame] = useState('day');
  const [averageData, setAverageData] = useState({
    averageCalories: 0,
    averageDuration: 0,
    totalDistance: 0,
    averageHeartRate: 0
  });
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
      const query = new URLSearchParams();
      for (const key in filters) {
        if (filters[key]) {
          query.append(key, filters[key]);
        }
      }
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workouts?${query.toString()}`);
      setWorkouts(response.data);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };

  // Function that fetches average and total data
  const fetchAverageData = async () => {
    try {
      const avgCalories = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-average-calories/${timeFrame}`);
      const totDistance = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-total-distance/${timeFrame}`);
      const avgDuration = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-average-duration/${timeFrame}`);
      const avgHeartRate = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-average-heartrate/${timeFrame}`);
      setAverageData({
        averageCalories: avgCalories.data.avg_calories,
        totalDistance: totDistance.data.total_distance,
        averageDuration: avgDuration.data.avg_duration,
        averageHeartRate: avgHeartRate.data.avg_heartrate

      });
    } catch (err) {
      console.error('Error fetching average data:', err);
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
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    };

    // Format options for date
    const dateOptions = {
      month: 'short',
      day: 'numeric',
    };
    const formattedTime = date.toLocaleString('en-US', timeOptions);
    const formattedDate = date.toLocaleString('en-US', dateOptions);

    return `${formattedTime} | ${formattedDate}`;
  }


  useEffect(() => {
    fetchWorkouts();
    fetchAverageData();
  }, [filters, timeFrame]);




  // Function to add a workout (used with add workout form)
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const workoutNameExists = workouts.some(workout => workout.workout_name === workoutForm.workout_name);

      if (!workoutNameExists) {

        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-workout`, {
          workout_name: workoutForm.workout_name,
          duration: workoutForm.duration,
          distance: workoutForm.distance,
          heart_rate: workoutForm.heart_rate
        });
        alert(`Workout successfully added: ${workoutForm.workout_name}`);
        // Reset form
        setWorkoutForm({
          workout_name: '',
          duration: '',
          distance: '',
          heart_rate: ''
        });
        fetchWorkouts();
        fetchAverageData();
      }
      else {
        alert("Workout name already exists. Please choose a different name.");
      }
    } catch (err) {
      console.error("Error adding workout:", err);
    }
  };

  // Function to delete a workout
  const deleteWorkout = async (workoutName) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-workout`, {
        data: { workout_name: workoutName }
      });
      alert(`Workout successfully deleted: ${workoutName}`);
      fetchWorkouts();
      fetchAverageData();
    }
    catch (err) {
      console.error('Error deleting workout:', err);
    }
  }

  const toggleTimeFrame = () => {
    const nextTimeFrame = timeFrame === 'day' ? 'week' : timeFrame === 'week' ? 'month' : 'day';
    setTimeFrame(nextTimeFrame);
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
                  <label className='sort-label' htmlFor="Sort By Date">{!reverse ? "Date ↓" : "Date ↑"}</label>
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
          <div className='average-data-container'>
            <div className='average-data add-workout-form'>
              <span>Average Calories: {Math.round(averageData.averageCalories)} kcal</span>
              <span>Average Duration: {Math.round(averageData.averageDuration)} min</span>
              <span>Average Heart-Rate: {Math.round(averageData.averageHeartRate)} bpm</span>
              <span>Total Distance: {Math.round(averageData.totalDistance)} mi</span>
              <button onClick={toggleTimeFrame}>Time Frame: {timeFrame}</button>
            </div>
          </div>

          <div className='workouts-container'>
            <p className='workouts-container-title'>Workouts</p>
            {workouts.length > 0 ? (
              (!reverse ? workouts.slice().reverse() : workouts).map((workout, index) => (
                <div key={index} className='workout-item'>
                  <div className='workout-details'>
                    <span>{workout.workout_name}</span>
                    <span title='Duration'><img className='icons' src="time-icon.svg" alt="duration icon" /> {Math.round(workout.duration)} min</span>
                    <span title='Distance'><img className='icons' src="distance-icon.svg" alt="distance icon" /> {workout.distance} mi</span>
                    <span title='Heart Rate'><img className='icons' src="heart-icon.svg" alt="heart icon" /> {workout.heart_rate} bpm</span>
                    <span title='Calories'><img className='icons' src="calorie-icon.svg" alt="calories icon" /> {workout.calories_burned} cal</span>
                    <span title='Time' style={{
                      fontSize: '0.8rem'
                    }}>{formatDate(workout.date_time)}</span>
                    <img title='Weather' className='icons' src={workout.weather} alt="weather icon" />
                    <button className='delete-button' title={workout.workout_name} onClick={(e) => deleteWorkout(e.target.title)}><img title={workout.workout_name} className='delete-icon' src='delete-icon.svg' /></button>
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