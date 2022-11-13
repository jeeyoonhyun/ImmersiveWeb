import React from 'react';
import { Link } from "react-router-dom";
import '../App.css'

export default function Header() {
  return (
    <nav className="header">
      <h1>
        <Link to="/">
          <strong>50 Days of Immersive Web</strong>
        </Link>
      </h1>
      <p><a href="https://www.instagram.com/jeeyoonhyun/" className="">Jeeyoon Hyun</a></p>
    </nav>
  );
}
