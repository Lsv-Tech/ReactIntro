import React, {Component} from 'react';

class CButton extends Component {
    constructor(props) {
        super(props);
        this.state = {clicked: false}
    }

    clickCallback(event) {
        this.setState({clicked: true});
        this.props.clickCallback();
    }

    render() {
        return (<button className={this.props.className} onClick={this.clickCallback.bind(this)}>
            {this.state.clicked ? 'You was taking me :D' : this.props.children}
        </button>)
    }

}

export default CButton;