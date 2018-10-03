class ChButton extends React.Component {
    constructor(props) {
        super(props);
    }


    componentDidUpdate() {
        console.log('update ' + this.props.msg)
    }

    componentWillUnmount() {
        console.log('unmount ' + this.props.msg)
    }

    render() {
        const owner = this;
        const style = {
            background: owner.props.color
        };

        return React.createElement('button',
            {
                className: 'changeBtn',
                style,
                onClick: function () {
                    owner.props.click_extra(owner.props.color);
                    owner.setState({pressed: true})
                }
            },
            this.props.msg
        )
    }
}
