import React, {Component} from 'react';

class Thumbnail extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return <img className='thumbnail' src={this.props.src}
        style=''/>
    }

}

const small = {
    width: '200px',
    height: '200px',
};

const medium = {
    width: '400px',
    height: '400px'
};

const large = {
    width: '600px',
    height: '600px'
};