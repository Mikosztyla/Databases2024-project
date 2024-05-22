import React, { useState, useEffect } from 'react';
import { useAuth } from '../contxt/AuthContext';

export default function Res() {
  const [tableNumber, setTableNumber] = useState(1);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('8:00');
  const [reservationDuration, setReservationDuration] = useState(0.5);
  const { isLoggedIn, login, logout } = useAuth();

  useEffect(() => {
    const id = localStorage.getItem('id');
    if (id) {
        login();
    } else {
        logout();
    }
  }, [login, logout]);

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = new Date(reservationDate);
    const currentDate = new Date();

    if (selectedDate <= currentDate) {
      alert('Please select a future date for reservation.');
      return false;
    }

    const reservationDateTime = new Date(reservationDate);
    const [hour, minute] = reservationTime.split(':').map(Number);
    reservationDateTime.setHours(hour, minute);
    const endTime = new Date(reservationDateTime);
    const additionalMinutes = reservationDuration * 60;
    endTime.setMinutes(endTime.getMinutes() + additionalMinutes);
    console.log("reservationDateTime: " + reservationDateTime + "   endTime: " + endTime)

    if (endTime.getHours() >= 22) {
      alert('Reservations cannot go beyond 10:00 PM.');
      return false;
    }

    try {
      const response = await fetch(`http://localhost:5000/reservations`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const existingReservations = await response.json();
      console.log(existingReservations);
      for (const res of existingReservations) {
        console.log(res.date + "   " + res.time)
        const existingStart = new Date(`${res.date}T${res.time}`);
        const existingEnd = new Date(existingStart);
        existingEnd.setHours(existingEnd.getHours() + res.duration);

        console.log("ExistingStart: " + existingStart, "   ExistingEnd: " + existingEnd)
        if (
            (reservationDateTime >= existingStart && reservationDateTime < existingEnd) ||
            (endTime > existingStart && endTime <= existingEnd) ||
            (reservationDateTime <= existingStart && endTime >= existingEnd)
        ) {
          alert('The selected time overlaps with an existing reservation.');
          return false;
        }
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('Failed to validate reservation.');
      return false;
    }

    return true;
  };

  const generateTimeOptions = () => {
    const options = [];

    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = `${hour.toString().padStart(2, '0')}`;
        const formattedMinute = `${minute.toString().padStart(2, '0')}`;
        const timeValue = `${formattedHour}:${formattedMinute}`;
        options.push(
            <option key={timeValue} value={timeValue}>
              {timeValue}
            </option>
        );
      }
    }

    return options;
  };

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

  const generateTableOptions = () => {
    const options = [];

    for (let number = 1; number <= 10; number += 1){
      options.push(
          <option key={number} value = {number}>
            {number}
          </option>
      );
    }

    return options;
  }

  const handleResSubmit = async (e) => {
    e.preventDefault();
    if (!(await handleReservationSubmit(e))) return;

      // console.log(localStorage.getItem('id'));
    //       // console.log(reservationDate);
    //       // console.log(reservationTime);
    //       // console.log(reservationDuration);
    //       // console.log(tableNumber);
      try {
        const response = await fetch('http://localhost:5000/res', {
          method: 'POST',
          body: JSON.stringify({
            user_id: localStorage.getItem('id'),
            date: reservationDate,
            time: reservationTime,
            duration: reservationDuration,
            table: tableNumber
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setReservationDate('')
          setReservationDuration(0.5)
          setReservationTime('8:00')
          setTableNumber(1)
          alert('Res successful');
        } else {
          alert('Res unsuccesful');
        }
      } catch (error) {
        console.error('Error submitting data:', error);
        alert('Failed to log in');
      }
    }

  return (
    <div>
      {isLoggedIn ? (
          <div>
            <h2>Make a Reservation</h2>
            <form>
              <div>
                <label>Table number: </label>
                <select value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required>
                  {generateTableOptions()}
                </select>
              </div>
              <div>
                <label>Reservation date: </label>
                <input type="date" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} required />
              </div>
              <div>
                <label>Reservation time: </label>
                <select value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} required>
                  {generateTimeOptions()}
                </select>
              </div>
              <div>
                <label>Reservation duration (hours): </label>
                <select value={reservationDuration} onChange={(e) => setReservationDuration(parseFloat(e.target.value))} required>
                  {generateDurationOptions()}
                </select>
              </div>
              <button onClick={handleResSubmit} type="submit">Make Reservation</button>
            </form>
          </div>
      ) : (
        <p>Please log in to make the reservation</p>
      )}
    </div>
  );
}