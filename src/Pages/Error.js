import React, { Component } from 'react';
import Header from '../components/Header.js'

// The number of columns change by resizing the window
class Error extends React.Component {
    render() {
        return (
            <div>
                <p>Page not found</p>
                <Header />
            </div>
        )
    }
}

export default Error;