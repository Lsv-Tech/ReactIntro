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
                        owner.setState({pressed: false});
                        owner.props.updateElements(false);
                    }
                },
                'Remove')
        } else {
            return React.createElement(
                'button',
                {
                    onClick: function () {
                        owner.setState({pressed: true});
                        owner.props.updateElements(true);
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
        this.state = {disableInput: false, inputValue: ''}
    }


    updateInput(state) {
        this.setState({disableInput: state})
    }

    updateTxtSize(event) {
        this.setState({inputValue: event.target.value})
    }

    changeDocument(TxtSize) {
        $(document).find('p').each(function (idx, ele) {
            $(ele).css('font-size', TxtSize + 'px');
        });
    }

    cleanDocument() {
        $(document).find('p').each(function (idx, ele) {
            $(ele).css('font-size', '');
        });
    }

    render() {

        const owner = this;
        const h3 = React.createElement('h3', null, 'Change Text Size');

        const input = React.createElement('input',
            {
                type: 'number',
                placeholder: 'insert a font-size',
                disabled: owner.state.disableInput ? true : null,
                value: owner.state.inputValue,
                onChange: owner.updateTxtSize.bind(owner)
            });

        const btn = React.createElement(ChTextButton, {updateElements: owner.updateInput.bind(owner)});

        if (owner.state.disableInput && owner.state.inputValue) {
            owner.changeDocument(owner.state.inputValue)
        } else {
            owner.cleanDocument()
        }

        return React.createElement(
            'div',
            {},
            h3,
            input,
            btn
        )
    }
}