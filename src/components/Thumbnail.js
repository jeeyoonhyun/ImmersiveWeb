import React, { Component } from 'react';
import {Link} from "react-router-dom";
import styled from "styled-components";

const Background = styled.div`
    background:url(${props => props.img}) no-repeat center center;
    background-size:cover;
    height:30vh;
    padding: 1.5em;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color:white;
    &:hover {
        opacity: .8;
    }
`

const Day = styled.h4`
    margin:0;
`

const Title = styled.h2`
    margin:0.5em 0 0 0;
`

// The number of columns change by resizing the window
class Thumbnail extends React.Component {
    render() {
        return (
            <div>
                <Link to= {this.props.day ? `day${this.props.day}`: `/`} >
                    <Background img = {this.props.img}>
                        <Day>{this.props.day ? `Day `+ this.props.day : null} </Day>
                        <Title>{this.props.title}</Title>
                    </Background>
                </Link>
            </div>
        )
    }
}

export default Thumbnail;