import React from 'react';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-items">
        <li><a href="">Alle</a></li>
        <li><a href="">Heute</a></li>
        <li><a href="">Dieses Wochenende</a></li>
        <li><a href="">Sport</a></li>
        <li><a href="">Essen & Trinken</a></li>
        <li><a href="">Volksfeste</a></li>
        <li><a href="">Kulturen & Traditionen</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
