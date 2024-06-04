import React, { useState, useEffect } from 'react';
import "./income.css";
import { Link } from 'react-router-dom';


const IncomeManager = () => {
  const [incomes, setIncomes] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: localStorage.getItem('id'),
    order_id: '',
    price: '',
    date: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('id') === null) {
      setLoggedIn(false);
    } else {
      setLoggedIn(true);
      fetchIncomes();
    }
  }, [loggedIn]);

  const fetchIncomes = async () => {
    try {
      const response = await fetch('http://localhost:5000/incomesList');
      const data = await response.json();
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editing ? `http://localhost:5000/incomes/${editId}` : 'http://localhost:5000/income';
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setFormData({
        employee_number: localStorage.getItem('id'),
        order_id: '',
        price: '',
        date: ''
      });

      setEditing(false);
      setEditId(null);
      fetchIncomes();
    } catch (error) {
      console.error('Error saving income', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/incomes/${id}`, {
        method: 'DELETE'
      });
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income', error);
    }
  };

  const handleEdit = (income) => {
    setFormData(income);
    setEditing(true);
    setEditId(income._id);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormData({
      employee_number: localStorage.getItem('id'),
      order_id: '',
      price: '',
      date: ''
    });
    setEditId(null);
  };

  return (
    <div className="container-incomes">
    <Link to='/' className="back-button">BACK</Link>
      {loggedIn ? (
          <div className="container-center">
            <h2>Income Manager</h2>
            <form onSubmit={handleSubmit}>
              <input
                  type="text"
                  name="order_id"
                  value={formData.order_id}
                  onChange={handleChange}
                  placeholder="Order ID"
                  autoComplete="off"
                  required
              />
              <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  autoComplete="off"
                  required
              />
              <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="Date"
                  required
              />
              {editing ? (
                  <>
                    <button type="submit">Edit</button>
                    <button type="button" onClick={cancelEdit}>Cancel Edit</button>
                  </>
              ) : (
                  <button type="submit">Add</button>
              )}
            </form>

            <div className="incomes-list">
              <h3>Incomes List</h3>
              <table className="income-table">
                <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {incomes.map((income) => (
                    <tr key={income._id}>
                      <td>{income.order_id}</td>
                      <td>${income.price}</td>
                      <td>{income.date}</td>
                      <td>
                        <button onClick={() => handleEdit(income)}>Edit</button>
                        <button onClick={() => handleDelete(income._id)}>Delete</button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
      ) : (
          <h1>You must be logged in</h1>
      )}
    </div>
  );
};

export default IncomeManager;
