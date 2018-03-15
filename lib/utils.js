import { action, observable, extendObservable, decorate } from "mobx";
import { observer } from "mobx-react";

const decorated = new Set();

export function observerWithProps(oProps) {
  const keys = Object.keys(oProps);
  return function(Class) {
    return (props, context) => {
      const Class2 = class extends Class {};
      keys.forEach(key => {
        Class2.prototype[key] = key in props ? props[key] : oProps[key];
        decorate(Class2, {
          [key]: observable
        });
      });
      const instance = observer(new Class2(props, context));

      const componentWillReceiveProps = instance.componentWillReceiveProps;
      instance.componentWillReceiveProps = action(function(props, context) {
        componentWillReceiveProps &&
          componentWillReceiveProps.call(instance, props, context);
        keys.forEach(oProp => {
          instance[oProp] = props[oProp];
        });
      });
      const shouldComponentUpdate =
        Class.prototype.hasOwnProperty("shouldComponentUpdate") &&
        instance.shouldComponentUpdate;
      instance.shouldComponentUpdate = function(props, context) {
        return shouldComponentUpdate
          ? shouldComponentUpdate.call(instance, props, context)
          : false;
      };
      return instance;
    };
  };
}
