class SizeInput extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement('input', {type: 'number', placeholder: 'insert a number'})
    }
}

class ChTextButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {pressed: false}
    }

    render() {
        const owner = this;
        if (this.state.pressed) {
            return React.createElement(
                'button',
                {
                    onClick: function () {
                        owner.props.parentHandler(false);
                        owner.props.click_extra();
                        owner.setState({pressed: false})
                    }
                },
                'Remove')
        } else {
            return React.createElement(
                'button',
                {
                    onClick: function () {
                        owner.props.parentHandler(true);
                        owner.setState({pressed: true})
                    }
                },
                'Apply'
            )
        }
    }
}

class TxtChangeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {btnPressed: false}
    }

    HandleBtnState(state){
        this.setState({btnPressed: state})
    }

    changeDocument(TxtSize) {
        $(document).find('p').each(function (idx, ele) {
            $(ele).css('font-size', TxtSize + 'px');
        });
    }

    render() {
        const inputEnable = this.state.btnPressed ? {disabled: 'true'}: null;
        const h3 = React.createElement('h3', null, 'Change Text Size');
        const input = React.createElement(ChTextButton, inputEnable, null);
        const btn = React.createElement(SizeInput, {parentHandler: this.HandleBtnState.bind(this)}, null);
        return React.createElement(
            'div',
            {},
            h3,
            input,
            btn
        )
    }
}