import React, { useState, useEffect } from 'react';
import { useAuth } from '../contxt/AuthContext';
import "./login.css"
import { Link } from 'react-router-dom';


export default function Login() {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerSurname, setRegisterSurname] = useState('');
  const [registerEmployeeNumber, setRegisterEmployeeNumber] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);

  // Function to fetch all users from the server
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/employees');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component mounts
    if (localStorage.getItem('id') === null) {
      setLoggedIn(false);
    } else {
      setLoggedIn(true);
    }
  }, [loggedIn]);

  const setStorage = (data) => {
    console.log(data.id);
    localStorage.setItem('id', data.id);
    setLoggedIn(true);
  };

  // Function to handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        body: JSON.stringify({ employee_number: employeeNumber, password: loginPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setStorage(data);
        setEmployeeNumber('');
        setLoginPassword('');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to log in');
    }
  };

  // Function to handle registration form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/employeeAdd', {
        method: 'POST',
        body: JSON.stringify({
          name: registerName,
          surname: registerSurname,
          employee_number: registerEmployeeNumber,
          password: registerPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful');
        setRegisterName('');
        setRegisterSurname('');
        setRegisterEmployeeNumber('');
        setRegisterPassword('');
        fetchUsers();
      } else if (response.status === 409){
        alert('Numer pracownika musi byc unikalny');
      } else {
        alert('Błąd dodawania pracownika');
      }
    } catch (error) {
      alert('Failed to register');
    }
  };

  return (
    <div className='container-login'>
      <div className='content'>
        <Link to='/' className="back-button">BACK</Link>
        {!loggedIn ? (
            <>
              <h1>Login</h1>
              <form onSubmit={handleLoginSubmit}>
                <input
                    type="number"
                    placeholder="Employee number"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
              </form>
              <h1>Register</h1>
              <form onSubmit={handleRegisterSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Surname"
                    value={registerSurname}
                    onChange={(e) => setRegisterSurname(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Employee number"
                    value={registerEmployeeNumber}
                    onChange={(e) => setRegisterEmployeeNumber(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
              </form>
            </>
        ) : (
            <>
              <h1>You are logged in as</h1>
              <h2>employee number: {localStorage.getItem('id')}</h2>
              <button onClick={() => {
                localStorage.removeItem('id');
                setLoggedIn(false);
                console.log(loggedIn);
              }}>Logout
              </button>
            </>
        )}

        {users.length > 0 ? (
          <div className="employee-list">
            <h2>Employees:</h2>
            <table className="employee-table">
              <thead>
              <tr>
                <th>Name</th>
                <th>Surname</th>
                <th>Employee Number</th>
              </tr>
              </thead>
              <tbody>
              {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.employee_number}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h2>No employees in the system</h2>
        )}
      </div>
    </div>
  );
}
