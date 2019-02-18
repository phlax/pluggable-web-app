
import React from 'react';


function isClassComponent(component) {
    return (
        typeof component === 'function' &&
        !!component.prototype.isReactComponent
    ) ? true : false;
}


export function withProps(WrappedComponent, defaultProps) {
    if (WrappedComponent === undefined) {
	console.log('wrapping something', defaultProps)
    }

    // this is wrong even if it works for current use
    if (!isClassComponent(WrappedComponent)) {
        class Wrapper {
            constructor  () {
                let arg0 = [...arguments][0] || {};
                let {props} = arg0;
                arg0.props = Object.assign({}, defaultProps, props);
                return new WrappedComponent(arg0, [...arguments].slice(1));
            }
        }
        return Wrapper;
    }

    const wrappedWithProps = class extends React.PureComponent {
	// this probs needs to recurse to the unwrapped component
	name = WrappedComponent.name;
        render() {
	    const props = Object.assign({}, defaultProps, this.props);
	    return <WrappedComponent {...props} />;
        }
    };
    const symWrapped = Symbol.for('wrapped');
    const symProps = Symbol.for('default-props');
    if (WrappedComponent[symWrapped]) {
        wrappedWithProps[symWrapped] = WrappedComponent[symWrapped];
    } else {
        wrappedWithProps[symWrapped] = WrappedComponent;
    }
    wrappedWithProps[symProps] = defaultProps;
    return wrappedWithProps;
}


export function listening (signals, events, name, WrappedComponent) {
    // force a refresh when events are emitted

    const symWrapped = Symbol.for('wrapped');
    let wrappedTarget = WrappedComponent;
    if (WrappedComponent[symWrapped]) {
        wrappedTarget = WrappedComponent[symWrapped];
    } else {
        wrappedTarget = WrappedComponent;
    }

    const wrappedWithListeners = class extends React.Component {
	// this probs needs to recurse to the unwrapped component
	state = {signal: null}
	name = wrappedTarget.name;

	componentWillMount () {
            for (let event of events) {
		if (typeof event === 'string') {
	            signals.listen(event, this.onChange, name);
		} else {
		    signals.listen(event[0], this.onChange, name);
		}
            }
	}

	componentWillUnmount () {
            for (let event of events) {
		if (typeof event === 'string') {
	            signals.unlisten(event, this.onChange);
		} else {
		    signals.unlisten(event[0], this.onChange);
		}
            }
	}

	onChange = async (signal, data) => {
	    for (let event of events) {
		if (Array.isArray(event)) {
		    if (event[0] === signal) {
			await event[1](this, data);
			return;
		    }
		} else if (event === signal) {
		    this.setState({signal: {signal, data}});
		}
	    }
	}

        render() {
            const {signal} = this.state;
            const extra = {};
            if (signal) {
                extra.signal = signal;
            }
	    return (
		<WrappedComponent
		  {...this.props}
                  {...extra}
		/>);
        }
    };
    wrappedWithListeners[symWrapped] = wrappedTarget;
    return wrappedWithListeners;
}



export function provided (providers, provides, WrappedComponent, async) {
    // force a refresh when events are emitted

    const symWrapped = Symbol.for('wrapped');
    let wrappedTarget = WrappedComponent;
    if (WrappedComponent[symWrapped]) {
        wrappedTarget = WrappedComponent[symWrapped];
    } else {
        wrappedTarget = WrappedComponent;
    }

    const wrappedWithProviders = class extends React.Component {
        state = {provided: null};

	async componentWillMount () {
	    for (let [k, provider] of Object.entries(provides || {})) {
                if (!providers[provider]) {
		    console.error('unrecognized provider' , provider);
                } else {
		    provided[k] = providers[provider];
                }
	    }
            this.setState({provided});
	}

        render() {
            if (!this.state.provided) {
                return '';
            }
	    return (
		<WrappedComponent
		  {...this.props}
                  {...this.state} />);
        }
    };
    wrappedWithProviders[symWrapped] = wrappedTarget;
    return wrappedWithProviders;
}


export function fetched (providers, fetches, WrappedComponent, async) {
    // force a refresh when events are emitted

    const symWrapped = Symbol.for('wrapped');
    let wrappedTarget = WrappedComponent;
    if (WrappedComponent[symWrapped]) {
        wrappedTarget = WrappedComponent[symWrapped];
    } else {
        wrappedTarget = WrappedComponent;
    }

    const wrappedWithFetched = class extends React.Component {
        state = {fetched: null};

	async componentWillMount () {
	    for (let [k, provider] of Object.entries(fetches || {})) {
		if (this.props.fetched && this.props.fetched[k]) {
		    fetched[k] = this.props.fetched[k];
                } else if (!providers[provider]) {
		    console.error('unrecognized provider' , provider);
                } else {
		    fetched[k] = await providers[provider].provide({props: this.props});
                }
	    }
            this.setState({fetched});
	}

        render() {
            if (!this.state.fetched) {
                return '';
            }
	    return (
		<WrappedComponent
		  {...this.props}
                  {...this.state} />);
        }
    };
    wrappedWithFetched[symWrapped] = wrappedTarget;
    return wrappedWithFetched;
}


export function conditional (condition, WrappedComponent) {

    const wrappedWithConditions = class extends React.Component {
	state = {visible: false}

	static getDerivedStateFromProps = (props, state) => {
	    if (!condition || condition(props)) {
		return {visible: true};
	    } else if (props.toggleButton) {
		props.toggleButton(props.name);
	    }
	    return {};
	}

	render () {
	    const {visible} = this.state;
	    const {toggleButton, ...props} = this.props;
	    if (!visible) {
		return '';
	    }
	    return (
		<WrappedComponent
		  {...props}
                />);
	}
    }
    return wrappedWithConditions;
}


export function emitsOnMount (WrappedComponent, signals, signal) {

    const wrappedWithEmissions = class extends React.PureComponent {

        async componentDidMount () {
	    signals.emit(signal, {});
        }

        render () {
	    return (
		<WrappedComponent
		  {...this.props}
                />);
	}
    }
    return wrappedWithEmissions;
}



export function configured (WrappedComponent, type, component, providers, signals, widgets) {
    const {condition, emits, onMount, fetches, listens, provides} = component;

    if (!WrappedComponent) {
	const {widget} = component;
	WrappedComponent = widgets[widget];
    }

    if (!WrappedComponent) {
	WrappedComponent = widgets[type];
    }

    const wrappedWithConfiguration = class extends React.Component {
	state = {active: {}}

        onClick = async (evt) => {
            signals.emit(component.emits, component.params);
        }

	static getDerivedStateFromProps(props, state) {
	    const {active} = props;
	    if (!active) {
		return {};
	    }
	    const {user} = active;
	    if (user !== state.active.user) {
		return {active};
	    }
	    return {}
	}

        render() {
	    if (condition) {
	        WrappedComponent = conditional(
		    condition,
		    WrappedComponent,
		    true);
            }

	    if (listens) {
	        WrappedComponent = listening(
		    signals,
		    listens,
		    'widget:',
		    WrappedComponent);
	    }

	    if (onMount) {
		WrappedComponent = emitsOnMount(
		    WrappedComponent, signals, onMount)
	    }

	    if (provides) {
	        WrappedComponent = provided(
		    providers,
		    provides,
		    WrappedComponent,
		    true);
            }

	    if (fetches) {
	        WrappedComponent = fetched(
		    providers,
		    fetches,
		    WrappedComponent,
		    true);
            }
	    let props = {...this.props}
	    if (emits) {
	        props.onClick = this.onClick;
	    }

	    return (
		<WrappedComponent
		  {...props}
                />);
        }
    };
    return wrappedWithConfiguration;
}
