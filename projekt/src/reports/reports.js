import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './reports.css';

const EmployeeTurnover = () => {
    const [turnoverData, setTurnoverData] = useState([]);
    const [month, setMonth] = useState('ALL');
    const [year, setYear] = useState('ALL');

    useEffect(() => {
        fetchEmployeeTurnover();
    }, [month, year]);

    const fetchEmployeeTurnover = async () => {
        try {
            const queryParameters = [];

            if (year !== 'ALL') {
                queryParameters.push(`year=${year}`);
            }

            if (month !== 'ALL') {
                queryParameters.push(`month=${month}`);
            }

            const queryString = queryParameters.length ? `?${queryParameters.join('&')}` : '';
            const url = `http://localhost:5000/employeeTurnover${queryString}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const employeesTurnover = await response.json();
            setTurnoverData(employeesTurnover);
        } catch (error) {
            console.error('Error fetching employees turnover:', error);
        }
    }

    const generateMonths = () => {
        return (
            <div>
                <label>Select month:</label>
                <select id="month" value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="ALL">ALL</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            </div>
        )
    }

    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2020; year <= currentYear; year++) {
            years.push(year);
        }

        return (
            <div>
                <label>Select year:</label>
                <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="ALL">ALL</option>
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        )
    }


    const saveReport = async () => {
        try {
            const response = await fetch('http://localhost:5000/saveTurnoverData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ turnoverData }),
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Error saving report');
        }
    }

    return (
        <div className="container-reports">
            <Link to='/' className="back-button">BACK</Link>
            <h1>Employee reports</h1>

            <div className="report-buttons">
                {generateMonths()}
                {generateYears()}
            </div>

            <button className="back-button" onClick={() => saveReport()}>Save report</button>

            <div className="report-list">
                <table className="report-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Count</th>
                        <th>Monetary turnover</th>
                    </tr>
                    </thead>
                    <tbody>
                    {turnoverData.map((report, index) => (
                        <tr key={index}>
                            <td>{report.name}</td>
                            <td>{report.surname}</td>
                            <td>{report.count}</td>
                            <td>{report.monetary_turnover}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTurnover;
