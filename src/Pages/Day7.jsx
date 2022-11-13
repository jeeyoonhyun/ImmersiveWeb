import React from 'react';

// The number of columns change by resizing the window
class Day7 extends React.Component {
    componentDidMount() {

    }
    render() {
        return (
            <div>
                <div id="container">
                    <canvas className="webgl"></canvas>
                </div>
            </div>
        )
    }
}

export default Day7;