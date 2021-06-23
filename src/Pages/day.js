import React, { Component } from 'react';
import { Link } from 'react-router';
import '../day1/style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from "three";

// The number of columns change by resizing the window
class day extends React.Component {
    componentDidMount() {
    //    insert three.js code
    }
    render() {
        return (
            <div>
                <canvas class="webgl"></canvas>
            </div>
        )
    }
}

export default day;