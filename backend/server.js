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
 * - min_duration: (int) Minimum duration (in seconds).
 * - max_duration: (int) Maximum duration (in seconds).
 * - min_distance: (decimal) Minimum distance (in miles).
 * - max_distance: (decimal) Maximum distance (in miles).
 * - heart_rate: (int) Exact heart rate.
 * - start_date: (string) Start date of workout.
 * - end_date: (string) End date of workout.
 * 
 * Response:
 * - 200: Array of workout objects.
 * - 400: 'Unable to retrieve workouts'
 * 
 * Example query: http://localhost:PORT/get-workouts?start_date=yesterday&end_date=yesterday
 *  Gets all workouts from yesterday
 */
app.get('/get-workouts', async (req, res) => {
  try {
    const filters = {
      workout_name: req.query.workout_name,
      min_duration: req.query.min_duration,
      max_duration: req.query.max_duration,
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
 * - date_time (optional): Defaults to current timestamp.
 * 
 * Response:
 * - 200: 'Workout added successfully'
 * - 400: 'Missing required workout data' or 'Error adding workout'
 */
app.post('/add-workout', (req, res) => {
  try {
    // Extracting workout data from request
    const { workout_name, duration, distance, heart_rate } = req.body;
    const date_time = new Date().toLocaleString();




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
      date_time
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
 * Function for adding new workout to database
 * @param {*} data The workout data
 */
async function addNewWorkout(data) {
  try {
    const query = {
      text: 'INSERT INTO workouts(workout_name, duration, distance, heart_rate, date_time) VALUES($1, $2, $3, $4, $5)',
      values: [data.workout_name, data.duration, data.distance, data.heart_rate, data.date_time]
    }

    await pool.query(query);
  }
  catch (err) {
    console.error('Error entering workout to DB:', err);
  }
}




/**
 * Function for getting all workouts
 * @returns All workouts
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

