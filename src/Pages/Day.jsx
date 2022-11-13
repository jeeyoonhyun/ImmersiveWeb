import React from 'react';
import { useLoaderData } from 'react-router-dom';
import Day1 from './Day1'
import Day2 from './Day2'
import Day3 from './Day3'
import Day4 from './Day4'
import Day5 from './Day5'
import Day6 from './Day6'
import Day7 from './Day7'


export async function loader({ params }) {
    return params.dayId;
}

export default function Day() {
    const dayId = useLoaderData();
    const days = {
        '1': Day1,
        '2': Day2,
        '3': Day3,
        '4': Day4,
        '5': Day5,
        '6': Day6,
        '7': Day7,
    }
    const ComponentName = days[dayId];
    return (
        <div >
            <ComponentName />
        </div>
    )
}
