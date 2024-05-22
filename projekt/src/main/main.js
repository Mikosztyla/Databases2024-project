import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link } from "react-router-dom";
import "./main.css"

export default function Main() {
    
    return(
        <div className='container'>
        <Link to='/reserv' id='reserv'>REZERWACJA</Link>
        <Link to='/log' id='log'>LOGOWANIE</Link>
        <Link to='/reviews' id='reviews'>OPINIE</Link>
        </div>
    )
}