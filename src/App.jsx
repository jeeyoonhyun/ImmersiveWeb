import './App.css';
import React from "react";
import { Outlet } from 'react-router-dom';
import Header from './Components/Header';

function App() {
  return (
    <div className="App">
      <Outlet />
      <Header />
    </div>
  );
}

export default App;
