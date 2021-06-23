import React from 'react';
import {Link} from "react-router-dom";
import styled from "styled-components";

const Navbar = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: white;
  color:black;
`

export default function Header() {
  return (
    <Navbar id="header">
      <h1>
        <Link to="/">
          <strong>50 Days of Immersive Web</strong> by Jeeyoon Hyun
        </Link>
      </h1>
      <nav>
        <ul>
          <li>
            <Link to="/About" className="">
              About
            </Link>
          </li>
          <li>
            <a href="https://www.instagram.com/jeeyoonhyun/" className="">
              Instagram
            </a>
          </li>
        </ul>
      </nav>
    </Navbar>
  );
}
