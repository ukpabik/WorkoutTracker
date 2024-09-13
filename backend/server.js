import axios from 'axios'
import express from 'express'
import pkg from 'pg'
import cors from 'cors'
import moment from 'moment'
import 'dotenv/config'
import { parse } from 'dotenv'

// Connecting to db using Postgresql

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Promise for connecting to database
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL:', err));


// Create table for workouts
(async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS workouts (
          workout_name TEXT PRIMARY KEY,
          duration INT NOT NULL,
          distance DECIMAL NOT NULL,
          heart_rate INT,
          weather TEXT,
          calories_burned INT NOT NULL,
          date_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

        )
      
      
      `);
    console.log('Tables created successfully.');
  }
  catch (err) {
    console.error('Error creating tables:', err);
  }
})();


// Port for connectivitiy
const port = process.env.PORT;

// Initialize Express server
const app = express();

app.use(cors());

// Parse JSON
app.use(express.json());


/**
 * GET /get-workouts
 * ----------------------------------------
 * Retrieves all workout records or 
 * filters them by the provided query parameters.
 * 
 * Method: GET
 * URL: /get-workouts
 * 
 * Query Parameters (Optional):
 * - workout_name: (string) Partial or full match on workout name.
 * - min_duration: (int) Minimum duration (in minutes).
 * - max_duration: (int) Maximum duration (in minutes).
 * - min_distance: (decimal) Minimum distance (in miles).
 * - max_distance: (decimal) Maximum distance (in miles).
 * - heart_rate: (int) Exact heart rate.
 * - start_date: (string) Start date in YYYY-MM-DD format or using keywords like today, yesterday, etc.
 * - end_date: (string) End date in YYYY-MM-DD format or using keywords like today, yesterday, etc.
 * 
 * Response:
 * - 200: Returns an array of workout objects.
 * - 400: Returns an error message indicating it cannot retrieve workouts.
 * 
 * Example query: http://localhost:PORT/get-workouts?start_date=yesterday&end_date=yesterday
 *  Gets all workouts from yesterday
 */
app.get('/get-workouts', async (req, res) => {
  try {
    const filters = {
      workout_name: req.query.workout_name,
      min_duration: req.query.min_duration * 60,
      max_duration: req.query.max_duration * 60,
      min_distance: req.query.min_distance,
      max_distance: req.query.max_distance,
      heart_rate: req.query.heart_rate
    };

    // Get the correct parsed start and ending time
    const { start_time, end_time } = parseDateRange(req.query.start_date, req.query.end_date);
    // console.log('Parsed Start Time:', start_time); TESTING
    // console.log('Parsed End Time:', end_time); TESTING
    if (start_time) filters.start_time = start_time;
    if (end_time) filters.end_time = end_time;


    const workouts = await getWorkouts(filters);

    if (!workouts) {
      res.status(400).send('No workouts found');
    }
    res.status(200).json(workouts);
  }
  catch (err) {
    res.status(400).send('Unable to retrieve workouts', err);
  }


});


/**
 * GET /get-total-distance/:timeframe
 * ------------------------------------
 * 
 * Retrieves the total distance covered in workouts
 * within the specified timeframe.
 * 
 * Method: GET
 * URL: /get-total-distance/:timeframe
 * 
 * Parameters
 * - timeframe (string): Timeframe for aggregation. Accepts day, week, month, year, etc.
 * 
 * Responses:
 * - 200 OK: Returns the total distance in miles within the specified timeframe.
 * - 400 Bad Request: Returns an error message indicating unable to retrieve data.
 * 
 * Example query: http://localhost:PORT/get-total-distance/week
 * Returns the total distance within the current week.
 */
app.get('/get-total-distance/:timeFrame', async (req, res) => {
  try {
    const { timeFrame } = req.params;
    const total = await pool.query(`SELECT SUM(distance) AS total_distance FROM workouts WHERE date_trunc($1, date_time) = date_trunc($1, NOW())`, [timeFrame]);

    const totalDistance = total.rows[0].total_distance || 0;

    res.status(200).json({ total_distance: totalDistance });
  }
  catch (err) {
    console.error('Error retrieving total distance:', err);
    res.status(400).send('Unable to retrieve total distance');
  }
});


/**
 * GET /get-average-duration/:timeframe
 * ------------------------------------
 * 
 * Retrieves the average workout duration
 * within the specified timeframe.
 * 
 * Method: GET
 * URL: /get-average-duration/:timeframe
 * 
 * Parameters
 * - timeframe (string): Timeframe for aggregation. Accepts day, week, month, year, etc.
 * 
 * Responses:
 * - 200 OK: Returns the average duration in minutes within the specified timeframe.
 * - 400 Bad Request: Returns an error message indicating unable to retrieve data.
 * 
 * Example query: http://localhost:PORT/get-average-duration/week
 * Returns the average duration within the current week.
 */
app.get('/get-average-duration/:timeFrame', async (req, res) => {
  try {
    const { timeFrame } = req.params;
    const avg = await pool.query(`SELECT AVG(duration) AS avg_duration FROM workouts WHERE date_trunc($1, date_time) = date_trunc($1, NOW())`, [timeFrame]);

    const averageDuration = (avg.rows[0].avg_duration) / 60 || 0;

    res.status(200).json({ avg_duration: averageDuration });
  }
  catch (err) {
    console.error('Error retrieving average duration:', err);
    res.status(400).send('Unable to retrieve average duration');
  }
});

/**
 * GET /get-average-heartrate/:timeframe
 * ------------------------------------
 * 
 * Retrieves the average heartrate
 * within the specified timeframe.
 * 
 * Method: GET
 * URL: /get-average-heartrate/:timeframe
 * 
 * Parameters
 * - timeframe (string): Timeframe for aggregation. Accepts day, week, month, year, etc.
 * 
 * Responses:
 * - 200 OK: Returns the average heartrate in bpm within the specified timeframe.
 * - 400 Bad Request: Returns an error message indicating unable to retrieve data.
 * 
 * Example query: http://localhost:PORT/get-average-heartrate/week
 * Returns the average heartrate within the current week.
 */
app.get('/get-average-heartrate/:timeFrame', async (req, res) => {
  try {
    const { timeFrame } = req.params;
    const avg = await pool.query(`SELECT AVG(heart_rate) AS avg_heartrate FROM workouts WHERE date_trunc($1, date_time) = date_trunc($1, NOW())`, [timeFrame]);

    const averageHeartRate = Math.round(avg.rows[0].avg_heartrate) || 0;

    res.status(200).json({ avg_heartrate: averageHeartRate });
  }
  catch (err) {
    console.error('Error retrieving average heart rate:', err);
    res.status(400).send('Unable to retrieve average heart rate');
  }
});

/**
 * GET /get-average-calories/:timeframe
 * ------------------------------------
 * 
 * Retrieves the average calories burned
 * within the specified timeframe.
 * 
 * Method: GET
 * URL: /get-average-calories/:timeframe
 * 
 * Parameters
 * - timeframe (string): Timeframe for aggregation. Accepts day, week, month, year, etc.
 * 
 * Responses:
 * - 200 OK: Returns the average calories burned in kcal within the specified timeframe.
 * - 400 Bad Request: Returns an error message indicating unable to retrieve data.
 * 
 * Example query: http://localhost:PORT/get-average-calories/week
 * Returns the average calories burned within the current week.
 */
app.get('/get-average-calories/:timeFrame', async (req, res) => {
  try {
    const { timeFrame } = req.params;
    const avg = await pool.query(`SELECT AVG(calories_burned) AS avg_calories FROM workouts WHERE date_trunc($1, date_time) = date_trunc($1, NOW())`, [timeFrame]);

    const averageCalories = Math.round(avg.rows[0].avg_calories) || 0;

    res.status(200).json({ avg_calories: averageCalories });
  }
  catch (err) {
    console.error('Error retrieving average calories:', err);
    res.status(400).send('Unable to retrieve average calories');
  }
});



/**
 * POST /add-workout
 * ----------------------------------------
 * Adds a new workout.
 * 
 * Method: POST
 * URL: /add-workout
 * 
 * Request Body (JSON):
 * - workout_name (string, required)
 * - duration (int, required): In seconds.
 * - distance (decimal, required): In kilometers.
 * - heart_rate (int, required)
 * 
 * Response:
 * - 200: 'Workout added successfully'
 * - 400: 'Missing required workout data' or 'Error adding workout'
 */
app.post('/add-workout', async (req, res) => {
  try {
    // Extracting workout data from request
    const { workout_name, duration, distance, heart_rate } = req.body;
    const date_time = new Date().toLocaleString();

    // Get weather data using Chapel Hill lat and lon
    const weatherData = await axios.get(`https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: 35.913200,
          lon: -79.055847,
          appid: process.env.OPENWEATHER_API_KEY
        }
      }
    )

    // POST REQUEST THAT RETURNS THE AMOUNT OF CALORIES BURNED WHILE RUNNING FOR A SPECIFIC DURATION
    const result = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/exercise',
      {
        query: `${Math.round(duration / 60)} minutes of running`,
      },
      {
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_API_KEY,
        },
      }
    );

    const calories_burned = Math.round(result.data.exercises[0].nf_calories);

    // console.log(weatherData.data.weather[0]) TESTING

    const extracted = weatherData.data.weather[0];
    const weatherIcon = extracted.icon;

    const weather = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`

    // Making sure request has all fields
    if (!duration || !distance || !workout_name || !heart_rate) {
      return res.status(400).send('Missing required workout data');
    }


    // Putting all data into one object
    const workout = {
      workout_name,
      duration,
      distance,
      heart_rate,
      date_time,
      weather,
      calories_burned
    }

    // Add workout to database
    addNewWorkout(workout);

    res.status(200).send(`Workout added successfully: ${JSON.stringify(workout)}`)

  }
  catch (err) {
    res.status(400).send('Error adding workout: ', err);
  }

});



/**
 * DELETE /delete-workout
 * --------------------------------
 * 
 * Deletes a workout from the database based on workout name.
 * 
 * Method: DELETE
 * URL: /delete-workout
 * 
 * Request Body (JSON):
 * - workoutName (string, required): Name of the workout to be deleted.
 * 
 * Responses:
 * - 200 OK: Returns a success alert.
 * - 400 Bad Request: Returns an error message indicating inability to delete workout.
 */
app.delete('/delete-workout', async (req, res) => {
  try {
    const workoutName = req.body.workoutName;

    await pool.query('DELETE FROM workouts WHERE workout_name = $1', [workoutName]);

    res.status(200).send(`Workout deleted successfully: ${JSON.stringify(workoutName)}`);
  }

  catch (err) {
    res.status(400).send('Unable to delete workout:', err);
  }
})





/**
 * Function for adding new workout to database
 * @param {*} data The workout data
 */
async function addNewWorkout(data) {
  try {
    const query = {
      text: 'INSERT INTO workouts(workout_name, duration, distance, heart_rate, date_time, weather, calories_burned) VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [data.workout_name, data.duration, data.distance, data.heart_rate, data.date_time, data.weather, data.calories_burned]
    }

    await pool.query(query);
  }
  catch (err) {
    console.error('Error entering workout to DB:', err);
  }
}




/**
 * Function for getting all workouts with filter parameters
 * @param {{}} [filters={}] The filters for what workouts to display
 * @returns All workouts within filter range
 */
async function getWorkouts(filters = {}) {
  try {
    const params = [];

    // Start query with true condition
    let query = 'SELECT * FROM workouts WHERE 1=1';


    // Add filters dynamically by appending to query
    if (filters.workout_name) {
      params.push(`%${filters.workout_name}%`);
      query += ` AND workout_name ILIKE $${params.length}`;
    }

    if (filters.min_duration) {
      params.push(filters.min_duration);
      query += ` AND duration >= $${params.length}`;
    }

    if (filters.max_duration) {
      params.push(filters.max_duration);
      query += ` AND duration <= $${params.length}`;
    }

    if (filters.min_distance) {
      params.push(filters.min_distance);
      query += ` AND distance >= $${params.length}`;
    }

    if (filters.max_distance) {
      params.push(filters.max_distance);
      query += ` AND distance <= $${params.length}`;
    }

    if (filters.heart_rate) {
      params.push(filters.heart_rate);
      query += ` AND heart_rate = $${params.length}`;
    }

    if (filters.start_time) {
      params.push(filters.start_time);
      query += ` AND date_time >= $${params.length}`;
    }

    if (filters.end_time) {
      params.push(filters.end_time);
      query += ` AND date_time < $${params.length}`;
    }

    // console.log('Start Time:', filters.start_time); TESTING
    // console.log('End Time:', filters.end_time); TESTING

    const response = await pool.query(query, params);

    return response.rows;
  }

  catch (err) {
    console.error('Error retrieving workout: ', err);
  }
}



/**
 * Function using moment js to format dates for simpler use.
 * 
 * @param {*} startDate The start date of retrieval
 * @param {*} endDate The end date of retrieval
 * @returns The parsed date range.
 */
function parseDateRange(startDate, endDate) {
  // console.log(startDate + ' : ' + endDate); TESTING
  let start_time, end_time;
  const now = moment();

  // Parse start date
  if (startDate === 'today') {
    start_time = now.startOf('day').toISOString();
  } else if (startDate === 'yesterday') {
    start_time = now.subtract(1, 'days').startOf('day').toISOString();
  } else if (startDate) {
    start_time = moment(startDate, 'YYYY-MM-DD').startOf('day').toISOString();
  }

  // Parse end date
  if (endDate === 'today') {
    // console.log(`Time: ${now.endOf('day').toISOString()}`); TESTING
    end_time = now.endOf('day').toISOString();
  } else if (endDate === 'yesterday') {
    // console.log(`Time: ${now.endOf('day').toISOString()}`); TESTING
    end_time = moment().subtract(1, 'days').endOf('day').toISOString();
  } else if (endDate) {
    // Start of day given
    end_time = moment(endDate, 'YYYY-MM-DD').add(1, 'days').startOf('day').toISOString();
  } else {
    // Defaults to the end of current day
    end_time = moment(startDate, 'YYYY-MM-DD').add(1, 'days').startOf('day').toISOString();
  }

  return { start_time, end_time };
}



// Listen to requests on express server
app.listen(port, () => {
  console.log('Server is live on port', port)
})

