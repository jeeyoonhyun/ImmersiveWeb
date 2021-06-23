import React, { Component } from 'react';
import Header from '../Components/Header.js'

// The number of columns change by resizing the window
class Page extends React.Component {
    render() {
        return (
            <div>
                <p>Page</p>
                <Header />
            </div>
        )
    }
}

export default Page;