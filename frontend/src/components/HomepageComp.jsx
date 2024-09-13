import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FootComp from './FootComp';
import Navbar from './Navbar';

function HomepageComp() {
  // State to store the list of workouts
  const [workouts, setWorkouts] = useState([]);

  // State to control the sorting order of workouts (ascending/descending)
  const [reverse, setReverse] = useState(false);

  // State to store the selected timeframe for fetching average data
  const [timeFrame, setTimeFrame] = useState('day');

  // State to store average and total statistics related to workouts
  const [averageData, setAverageData] = useState({
    averageCalories: 0,
    averageDuration: 0,
    totalDistance: 0,
    averageHeartRate: 0
  });

  // State to manage the form inputs for adding a new workout
  const [workoutForm, setWorkoutForm] = useState({
    workout_name: '',
    duration: '',
    distance: '',
    heart_rate: ''
  });

  // State to manage the filter inputs for fetching workouts
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

  // State to control the visibility of the filter dropdown
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /**
   * toggleFilterBar Function
   * ------------------------
   * Toggles the visibility of the filter dropdown.
   */
  const toggleFilterBar = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  /**
   * fetchWorkouts Function
   * -----------------------
   * Fetches the list of workouts from the backend based on the applied filters.
   * Converts the filters object into URL query parameters.
   */
  const fetchWorkouts = async () => {
    try {
      const query = new URLSearchParams();
      // Iterate over each filter and append it to the query if it's not empty
      for (const key in filters) {
        if (filters[key]) {
          query.append(key, filters[key]);
        }
      }
      // Make a GET request to the backend with the query parameters
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workouts?${query.toString()}`);
      // Update the workouts state with the fetched data
      setWorkouts(response.data);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };

  /**
   * fetchAverageData Function
   * --------------------------
   * Fetches average and total statistics related to workouts based on the selected timeframe.
   * Makes multiple GET requests to different endpoints to gather all necessary data.
   */
  const fetchAverageData = async () => {
    try {
      // Fetch average calories burned
      const avgCalories = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-average-calories/${timeFrame}`);
      // Fetch total distance covered
      const totDistance = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-total-distance/${timeFrame}`);
      // Fetch average workout duration
      const avgDuration = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-average-duration/${timeFrame}`);
      // Fetch average heart rate
      const avgHeartRate = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-average-heartrate/${timeFrame}`);

      // Update the averageData state with the fetched statistics
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

  /**
   * handleInputChange Function
   * --------------------------
   * Handles changes in the workout submission form inputs.
   * Updates the workoutForm state with the new input values.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setWorkoutForm({
      ...workoutForm,
      [name]: value
    });
  };

  /**
   * handleFilterChange Function
   * ---------------------------
   * Handles changes in the filter inputs.
   * Updates the filters state with the new filter values.
   */
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  /**
   * handleCheckbox Function
   * -----------------------
   * Toggles the sorting order of the workouts list.
   * If reverse is true, workouts are sorted in ascending order; otherwise, descending.
   */
  const handleCheckbox = () => {
    setReverse(!reverse);
  };

  /**
   * formatDate Function
   * -------------------
   * Formats an ISO date string into a more readable format.
   *
   * @param {string} isoDate - The ISO date string to format.
   * @returns {string} - The formatted date and time string.
   */
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

    // Format time and date separately
    const formattedTime = date.toLocaleString('en-US', timeOptions);
    const formattedDate = date.toLocaleString('en-US', dateOptions);

    return `${formattedTime} | ${formattedDate}`;
  }

  /**
   * useEffect Hook
   * --------------
   * Fetches workouts and average data whenever the filters or timeframe change.
   */
  useEffect(() => {
    fetchWorkouts();
    fetchAverageData();
  }, [filters, timeFrame]);

  /**
   * handleSubmit Function
   * ---------------------
   * Handles the submission of the add workout form.
   * Validates if the workout name already exists to prevent duplicates.
   * Sends a POST request to add the new workout and updates the state accordingly.
   *
   * @param {Event} event - The form submission event from the add workout button.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Check if a workout with the same name already exists
      const workoutNameExists = workouts.some(workout => workout.workout_name === workoutForm.workout_name);

      if (!workoutNameExists) {
        // Send a POST request to add the new workout
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-workout`, {
          workout_name: workoutForm.workout_name,
          duration: workoutForm.duration,
          distance: workoutForm.distance,
          heart_rate: workoutForm.heart_rate
        });

        // Alert the user of successful addition
        alert(`Workout successfully added: ${workoutForm.workout_name}`);

        // Reset the workout form inputs
        setWorkoutForm({
          workout_name: '',
          duration: '',
          distance: '',
          heart_rate: ''
        });

        // Fetch updated workouts and average data
        fetchWorkouts();
        fetchAverageData();
      }
      else {
        // Alert the user if the workout name already exists
        alert("Workout name already exists. Please choose a different name.");
      }
    } catch (err) {
      console.error("Error adding workout:", err);

    }
  };

  /**
   * deleteWorkout Function
   * ----------------------
   * Handles the deletion of a workout.
   * Sends a DELETE request to remove the specified workout and updates the state accordingly.
   *
   * @param {string} workoutName - The name of the workout to delete.
   */
  const deleteWorkout = async (workoutName) => {
    try {
      // Send a DELETE request with the workout name in the request body
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-workout`, {
        data: { workout_name: workoutName }
      });

      // Alert the user of successful deletion
      alert(`Workout successfully deleted: ${workoutName}`);

      // Fetch updated workouts and average data
      fetchWorkouts();
      fetchAverageData();
    }
    catch (err) {
      console.error('Error deleting workout:', err);

    }
  }

  /**
   * toggleTimeFrame Function
   * ------------------------
   * Toggles the timeframe for fetching average data between 'day', 'week', and 'month'.
   */
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