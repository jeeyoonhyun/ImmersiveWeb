import React from 'react';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import Thumbnail from './Thumbnail.js';

// The number of columns change by resizing the window
export default function Gallery() {
    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
            style={{height:'100vh'}}
        // https://github.com/cedricdelpoux/react-responsive-masonry#readme
        >
            <Masonry>
                <Thumbnail day="7" title="Materialize" img="./assets/day7/day7.gif" />
                <Thumbnail day="6" title="Dithering" img="./assets/day6/day6.gif" />
                <Thumbnail day="5" title="Custom Postprocessing" img="./assets/day5/day5.gif" />
                <Thumbnail day="4" title="10000" img="./assets/day4/day4.gif" />
                <Thumbnail day="3" title="Rotation" img="./assets/day3/day3.gif" />
                <Thumbnail day="2" title="Postprocessing" img="./assets/day2/day2.gif" />
                <Thumbnail day="1" title="Diving" img="./assets/day1/day1.gif" />
            </Masonry>
        </ResponsiveMasonry>
    )
}