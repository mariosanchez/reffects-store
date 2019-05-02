import React, { Component } from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import subscribe from './subscriptions';
import * as storeModule from './store';

configure({ adapter: new Adapter() });

describe('subscriptions', () => {
  function Child() {
    return <div />;
  }

  it('should pass mapped state as props', () => {
    const store = storeModule;
    store.initialize({ a: 'b' });
    const SubscribedChild = subscribe(state => ({ a: state.a }), store)(Child);

    const wrapper = mount(<SubscribedChild />);

    const child = wrapper.find(Child).first();
    expect(child.props()).toEqual({
      a: 'b',
    });
  });

  it('should use the store module by default', () => {
    const store = storeModule;
    store.initialize({ a: 'b' });
    const SubscribedChild = subscribe(state => ({ a: state.a }))(Child);

    const wrapper = mount(<SubscribedChild />);

    const child = wrapper.find(Child).first();
    expect(child.props()).toEqual({
      a: 'b',
    });
  });

  it('should subscribe and unsubscribe to store', () => {
    const store = storeModule;
    store.initialize({ a: null });
    jest.spyOn(store, 'subscribe');
    jest.spyOn(store, 'unsubscribe');
    const SubscribedChild = subscribe(state => ({ a: state.a }), store)(Child);

    expect(store.subscribe).not.toHaveBeenCalled();
    const mountedProvider = mount(<SubscribedChild />);

    expect(store.subscribe).toBeCalledWith(expect.any(Function));

    store.setState({ path: ['a'], newValue: 'b' });

    expect(store.unsubscribe).not.toHaveBeenCalled();
    mountedProvider.unmount();
    expect(store.unsubscribe).toBeCalled();
  });

  it('should call force update when the state changes', () => {
    const store = storeModule;
    store.initialize({ a: null });
    let numCalls = 0;
    const SubscribedChild = subscribe(state => ({ a: state.a }), store)(Child);

    const wrapper = mount(<SubscribedChild />);

    wrapper.instance().forceUpdate = function() {
      numCalls++;
    };

    expect(numCalls).toBe(0);

    store.setState({ path: ['a'], newValue: 'b' });

    expect(numCalls).toBe(1);
  });

  it("shouldn't call force update when the state is the same", () => {
    const store = storeModule;
    store.initialize({ a: 1 });
    let numCalls = 0;
    const SubscribedChild = subscribe(state => ({ a: state.a }), store)(Child);

    const wrapper = mount(<SubscribedChild />);

    wrapper.instance().forceUpdate = function() {
      numCalls++;
    };

    expect(numCalls).toBe(0);

    store.setState({ path: ['a'], newValue: 1 });

    expect(numCalls).toBe(0);
  });

  it('should call force update when the parent pass new props', () => {
    const store = storeModule;
    store.initialize({ a: null });
    let numCalls = 0;

    const SubscribedChild = subscribe(
      (state, ownProps) => ({ a: state.a, b: ownProps.b }),
      store
    )(Child);

    function Parent({ b }) {
      return <SubscribedChild b={b} />;
    }

    const wrapper = mount(<Parent b={'a'} />);

    wrapper.find(SubscribedChild).instance().forceUpdate = function() {
      numCalls++;
    };

    expect(numCalls).toBe(0);

    wrapper.setProps({ b: 'koko' });

    expect(numCalls).toBe(1);
  });
});
