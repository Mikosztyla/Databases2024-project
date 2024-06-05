import React, { useState, useEffect } from 'react';
import "./expenses.css";
import { Link } from 'react-router-dom';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: '',
    item: '',
    quantity: '',
    price: '',
    date: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('id') === null) {
      setLoggedIn(false);
    } else {
      setLoggedIn(true);
      fetchExpenses();
      setFormData((prevFormData) => ({
        ...prevFormData,
        employee_number: localStorage.getItem('id')
      }));
    }
  }, [loggedIn]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('http://localhost:5000/expensesList');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses', error);
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
      const url = editing ? `http://localhost:5000/expenses/${editId}` : 'http://localhost:5000/expense';
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
        item: '',
        quantity: '',
        price: '',
        date: ''
      });

      setEditing(false);
      setEditId(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/expenses/${id}`, {
        method: 'DELETE'
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense', error);
    }
  };

  const handleEdit = (expense) => {
    setFormData(expense);
    setEditing(true);
    setEditId(expense._id);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormData({
      employee_number: localStorage.getItem('id'),
      item: '',
      quantity: '',
      price: '',
      date: ''
    });
    setEditId(null);
  };

  return (
    <div className="container-expenses">
      <Link to='/' className="back-button">BACK</Link>
        {loggedIn ? (
            <>
              <h2>Expense Manager</h2>
              <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    placeholder="Item"
                    autoComplete="off"
                    required
                />
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Quantity"
                    autoComplete="off"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={formData.unit_price}
                    onChange={handleChange}
                    placeholder="Unit Price"
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

              <div className="expense-list">
                <h3>Expenses List</h3>
                <table className="expense-table">
                  <thead>
                  <tr>
                    <th>Employee Number</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{expense.employee_number}</td>
                        <td>{expense.item}</td>
                        <td>{expense.quantity}</td>
                        <td>{expense.unit_price}$</td>
                        <td>{expense.date}</td>
                        <td>
                          <button onClick={() => handleEdit(expense)}>Edit</button>
                          <button onClick={() => handleDelete(expense._id)}>Delete</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </>
        ) : (
            <h1>You must be logged in</h1>
        )}
    </div>
  );
};

export default ExpenseManager;
  