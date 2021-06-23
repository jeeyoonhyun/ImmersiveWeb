import React, { Component } from 'react';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import Thumbnail from './Thumbnail.js';

// The number of columns change by resizing the window
class Gallery extends React.Component {
    render() {
        return (
            <ResponsiveMasonry
                columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
                // https://github.com/cedricdelpoux/react-responsive-masonry#readme
            >
                <Masonry>
                    <Thumbnail day="1" title="Diving" img="./assets/day1/day1.gif"/>
                    <Thumbnail day="2" title="Postprocessing" img="./assets/day2/day2.gif"/>
                    <Thumbnail day="3" title="Rotation" img="./assets/day3/thumbnail.png"/>
                    <Thumbnail img=""/>
                    <Thumbnail img=""/>
                    <Thumbnail img=""/>
                </Masonry>
            </ResponsiveMasonry>
        )
    }
}

export default Gallery;