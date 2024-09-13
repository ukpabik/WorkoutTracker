# Overview

This project is a workout tracking application consisting of a backend API and a frontend interface. Users can log workouts, retrieve workout data with filters, and view statistical summaries such as total distance, average duration, average heart rate, and average calories burned over different timeframes.

## Table of Contents
- [Features](#features)
- [Design Decisions](#design-decisions)
- [Technologies Used](#technologies-used)
- [Endpoints](#endpoints)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Testing the API](#testing-the-api)

## Features
- **Add Workouts**: Users can add new workouts with details like name, duration, distance, and heart rate.
- **Retrieve Workouts**: Fetch all workouts or filter them based on various parameters.
- **Statistical Summaries**: Get total distance, average duration, heart rate, and calories burned over specified timeframes.
- **Delete Workouts**: Remove workouts from the database.
- **Responsive Frontend**: A React-based frontend application for interacting with the API.

## Design Decisions

### Backend
- **Node.js and Express.js**: Chosen for their simplicity and well-developed modules, making it easy to set up a RESTful API.
- **PostgreSQL**: Selected for its reliability and powerful features suitable for relational data storage.
- **External APIs**:
  - **OpenWeatherMap API**: Integrates current weather data into workouts, providing additional information.
  - **Nutritionix API**: Calculates calories burned based on workout duration and activity type.

### Frontend
- **React**: Provides a component-based architecture, facilitating reusable UI components and efficient state management.
- **Axios**: Used for making HTTP requests to the backend API.
- **Responsive Design**: Ensures the application is accessible and user-friendly across various devices.

### Date Handling
- **Moment.js**: Utilized for parsing and formatting dates, simplifying date manipulations and ensuring consistency.

### Environment Variables
- **dotenv**: Manages sensitive information like API keys and database URLs, keeping them secure and configurable.

## Technologies Used

### Backend
- Node.js
- Express.js
- PostgreSQL
- Axios
- Moment.js
- dotenv
- pg (PostgreSQL client for Node.js)
- cors

### Frontend
- React
- Axios

## API Endpoints

- **POST /add-workout**: Adds a new workout with details like name, duration, distance, and heart rate.

- **GET /get-workouts**: Retrieves all workouts or filters them by parameters such as name, duration, distance, heart rate, and date range.

- **GET /get-total-distance/:timeframe**: Returns the total distance covered within a specified timeframe (e.g., day, week, month).

- **GET /get-average-duration/:timeframe**: Returns the average workout duration within a specified timeframe.

- **GET /get-average-heartrate/:timeframe**: Retrieves the average heart rate for workouts within a given timeframe.

- **GET /get-average-calories/:timeframe**: Retrieves the average calories burned within the specified timeframe.

- **DELETE /delete-workout**: Deletes a workout from the database by its name.

## Setup and Installation

### Prerequisites
- Node.js (version 14 or above)
- npm or yarn
- PostgreSQL database
- OpenWeatherMap API Key
- Nutritionix API Key and App ID

### Clone the Repository
```bash
git clone https://github.com/yourusername/yourrepository.git
cd yourrepository
```

### Backend Setup
Navigate to the backend directory:
```bash
cd backend
```
Install dependencies:
```bash
npm install
```
Set up environment variables by creating a .env file:
```bash
PORT=your_port_number
SUPABASE_DATABASE_URL=your_database_connection_string
OPENWEATHER_API_KEY=your_openweather_api_key
NUTRITIONIX_API_KEY=your_nutritionix_api_key
NUTRITIONIX_APP_ID=your_nutritionix_app_id
BACKEND_URL=http://localhost:
```

### Database Setup
Ensure the PostgreSQL database is running. The application
will automatically create the workouts table.

### Frontend Setup
Navigate to the backend directory:
```bash
cd ../frontend
```
Install dependencies:
```bash
npm install
```
Set up environment variables by creating a .env file:
```bash
VITE_BACKEND_URL=http://localhost:your_port_number
```

## Running the Application
Start the backend server
```bash
cd backend
npm start
```
Start the frontend application
```bash
cd frontend
npm run dev
```
The frontend will be accessible at http://localhost:5173

