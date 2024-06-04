import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link } from "react-router-dom";
import "./main.css"

export default function Main() {
    
    return(
        <div className='container-main'>
            <Link to='/reserv' id='reserv'>RESERVATIONS</Link>
            <Link to='/log' id='log'>LOGIN</Link>
            <Link to='/expenses' id='expenses'>EXPENSES</Link>
            <Link to='/incomes' id='incomes'>INCOMES</Link>
            <Link to='/reports' id='reports'>REPORTS</Link>
        </div>
    )
}