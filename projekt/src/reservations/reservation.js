import React, { useState, useEffect } from 'react';
import { useAuth } from '../contxt/AuthContext';
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import './reservation.css';

export default function Res() {
  // State variables
  const [tableNumber, setTableNumber] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [client, setClient] = useState('');
  const [clientToFind, setClientToFind] = useState('');
  const [reservationDuration, setReservationDuration] = useState(0);
  const [allReservations, setAllReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [properties, setProperties] = useState(null);
  const { isLoggedIn, login, logout } = useAuth();

  // Initial authentication check
  useEffect(() => {
    const id = localStorage.getItem('id');
    if (id) {
      login();
    } else {
      logout();
    }
  }, [login, logout]);

  // Fetch reservations and configuration on component mount
  useEffect(() => {
    fetchReservations();
    fetchRestaurantConfiguration();
  }, []);

  // Set default values when properties are loaded
  useEffect(() => {
    if (properties) {
      console.log(properties);
    }

    let formattedOpeningTime = "";
    if (properties){
      const [hour, minute] = properties?.openingTime.split(':');
      const formattedHour = hour.padStart(2, '0');
      formattedOpeningTime = `${formattedHour}:${minute}`;
    }

    setTableNumber('1');
    setReservationTime(formattedOpeningTime);
    setReservationDuration(0.5);
    setClient('');
    setReservationDate(format(new Date(), 'yyyy-MM-dd'));
  }, [properties]);

  // Filter reservations by table number whenever it changes
  useEffect(() => {
    filterReservations();
  }, [tableNumber, allReservations, clientToFind]);

  // Function to filter reservations by table number
  const filterReservations  = () => {
    let filtered;
    if (clientToFind) {
      filtered = allReservations.filter(reservation => reservation.client.toLowerCase().includes(clientToFind.toLowerCase()));
    } else {
      filtered = allReservations.filter(reservation => reservation.table === tableNumber);
    }
    setFilteredReservations(filtered);
  };

  // Function to fetch reservations from the server
  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5000/reservations');
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const reservations = await response.json();
      setAllReservations(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  // Function to fetch restaurant configuration from the server
  const fetchRestaurantConfiguration = async () => {
    try {
      const response = await fetch('http://localhost:5000/config');
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const config = await response.json();
      setProperties(config[0]);
    } catch (error) {
      console.error('Error fetching restaurant configuration:', error);
    }
  };

  // Function to generate time options for the reservation form
  const generateTimeOptions = () => {
    const options = [];
    if (!properties) return;
    const [openHour, openMinute] = properties?.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = properties?.closingTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const formattedHour = `${currentHour.toString().padStart(2, '0')}`;
      const formattedMinute = `${currentMinute.toString().padStart(2, '0')}`;
      const timeValue = `${formattedHour}:${formattedMinute}`;
      options.push(
          <option key={timeValue} value={timeValue}>
            {timeValue}
          </option>
      );

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return options;
  };

  // Function to generate duration options for the reservation form
  const generateDurationOptions = () => {
    const options = [];
    for (let duration = 0.5; duration <= 12; duration += 0.5) {
      options.push(
          <option key={duration} value={duration}>
            {duration}
          </option>
      );
    }

    return options;
  };

  // Function to generate table options for the reservation form
  const generateTableOptions = () => {
    const options = [];
    for (let number = 1; number <= (properties?.numberOfTables || 10); number++) {
      options.push(
          <option key={number} value={number}>
            {number}
          </option>
      );
    }

    return options;
  };

  // Function to validate the selected date
  const validateDate = async (e) => {
    const selectedDate = e.target.value;

    if (properties) {
      if (properties.closedDays.includes(selectedDate)) {
        alert('The selected date falls on a closed day.');
        return;
      }
    }

    setReservationDate(selectedDate);
  };

  // Function to handle reservation form submission
  const handleResSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/res', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: localStorage.getItem('id').toString(),
          client: client,
          date: reservationDate,
          time: reservationTime,
          duration: reservationDuration,
          table: tableNumber.toString(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        fetchReservations();
        alert('Reservation successful');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert(error.message);
    }
  };

  // Function to handle reservation deletion
  const handleDeleteReservation = async (reservationId) => {
    try {
      const response = await fetch(`http://localhost:5000/reservations/${reservationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      // Remove the deleted reservation from the state
      setAllReservations(allReservations.filter(reservation => reservation._id !== reservationId));
      alert('Reservation deleted successfully');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Failed to delete reservation');
    }
  };

  // Sort reservations by date and time
  const sortedReservations = filteredReservations.slice().sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.time}`);
    const dateTimeB = new Date(`${b.date} ${b.time}`);
    return dateTimeA - dateTimeB;
  });

  // Render the component
  return (
      <div className="container-reservations">
        <Link to="/" className="back-button">BACK</Link>
        {isLoggedIn ? (
            <div className="container-logged-in">
              <div className="reservation-form">
                <h2>Make a Reservation</h2>
                <form onSubmit={handleResSubmit}>
                  <div>
                    <label>Table number: </label>
                    <select value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required>
                      {generateTableOptions()}
                    </select>
                  </div>
                  <div>
                    <label>Reservation date: </label>
                    <input type="date" value={reservationDate} onChange={(e) => validateDate(e)} required/>
                  </div>
                  <div>
                    <label>Reservation time: </label>
                    <select value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} required>
                      {generateTimeOptions()}
                    </select>
                  </div>
                  <div>
                    <label>Reservation duration (hours): </label>
                    <select value={reservationDuration}
                            onChange={(e) => setReservationDuration(parseFloat(e.target.value))} required>
                      {generateDurationOptions()}
                    </select>
                  </div>
                  <div>
                    <label>Client: </label>
                    <input type="input" value={client} onChange={(e) => setClient(e.target.value)} required/>
                  </div>
                  <button type="submit">Make Reservation</button>
                </form>
              </div>

              <div className="reservation-list">
                <div>
                  <label>Find reservations for client: </label>
                  <input type="input" value={clientToFind} onChange={(e) => setClientToFind(e.target.value)} required/>
                </div>

                {sortedReservations.length > 0 ? (
                    <div>
                      {!clientToFind ? <h2>Reservations for table number: {tableNumber}</h2> : <></>}
                      <table>
                        <thead>
                        <tr>
                          <th>Client</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Duration</th>
                          <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedReservations.map((reservation, index) => (
                            <tr key={index}>
                              <td>{reservation.client}</td>
                              <td>{reservation.date}</td>
                              <td>{reservation.time}</td>
                              <td>{reservation.duration} hours</td>
                              <td>
                                <button onClick={() => handleDeleteReservation(reservation._id)}>Delete</button>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                    <h2>No reservations for table number: {tableNumber}</h2>
                )}
              </div>
            </div>
        ) : (
            <h2>Please log in to make the reservation</h2>
        )}
      </div>
  );
}
