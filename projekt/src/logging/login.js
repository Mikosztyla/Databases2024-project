import React, { useState, useEffect } from 'react';
import { useAuth } from '../contxt/AuthContext';
import "./login.css"

export default function Login() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [users, setUsers] = useState([]);
  const { isLoggedIn, login, logout} = useAuth();

  // Function to fetch all users from the server
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component mounts
  }, []);

  // Function to handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login request
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        body: JSON.stringify({ name: loginName, password: loginPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        localStorage.setItem('id', data.user.id);
        localStorage.setItem('email', data.user.email);
        alert('Login successful');
        setLoginName('');
        setLoginPassword('');
        login();
        fetchUsers();
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
      // Send registration request
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.warn(data);
      if (response.ok) {
        alert('Registration successful');
        // Clear input fields
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        // Fetch updated users after successful submission
        login();
        fetchUsers();
      } else {
        alert('Failed to register');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to register');
    }
  };

  return (
    <div className='container'>
      <div className='content'>
        {!isLoggedIn ? 
        (
        <>
        <h1>Zaloguj się</h1>
        <form onSubmit={handleLoginSubmit}>
          <input
            type="text"
            placeholder="name"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>

        <h1>Zarejestruj się</h1>
        <form onSubmit={handleRegisterSubmit}>
          <input
            type="text"
            placeholder="name"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          <input
            type="email"
            placeholder="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        </>) : <></>}

        {/* Display users */}
        <div>
          <h2>Users:</h2>
          <ul>
            {users.map((user) => (
              <li key={user._id}>
                <strong>{user.name}</strong> - {user.email}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {isLoggedIn ? (
            <button onClick={logout}>Logout</button>
          ): <></>}
        </div>
      </div>
    </div>
  );
}
