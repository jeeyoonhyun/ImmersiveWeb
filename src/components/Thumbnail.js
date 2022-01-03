import React, { Component } from 'react';
import {Link} from "react-router-dom";
import styled from "styled-components";

const Background = styled.div`
    background:linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.5)), url(${props => props.img}) no-repeat center center;
    background-size:cover;
    height:30vh;
    padding: 1.5em;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    &:hover {
        background:url(${props => props.img}) no-repeat center center;
        background-size:cover;
    }
`

const Day = styled.h4`
    margin:0;
    color:#fff;
`

const Title = styled.h2`
    margin:0.5em 0 0 0;
    color:#fff;
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