import React, { Component } from 'react';
import Header from '../Components/Header.js'

// The number of columns change by resizing the window
class About extends React.Component {
    render() {
        return (
            <div>
                <section>
                    <h2>About this project</h2>
                    <p>
                    <strong>50 days of Immersive Web</strong> is a personal project making 50 web experiments for 50 days
                    </p>
                    <h2>Follow me on</h2>
                </section>
                
                <Header />
            </div>
        )
    }
}

export default About;