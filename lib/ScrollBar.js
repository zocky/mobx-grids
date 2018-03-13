import React from "react";
import { Draggable } from "./Draggable.js";

import _ from "lodash";

export class ScrollBar extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    if (props.horizontal) {
      this.style = {
        left: 0,
        height: (this.props.thickness || 12) + "px",
        flexFlow: "row"
      };
      this.clientDimension = "clientWidth";
      this.deltaDimension = "deltaX";
    } else {
      this.style = {
        top: 0,
        width: (this.props.thickness || 12) + "px",
        flexFlow: "column"
      };
      this.clientDimension = "clientHeight";
      this.deltaDimension = "deltaY";
    }
  }

  clientSize = 100;

  handleDragStart = (event, dd) => {
    dd.originalValue = this.props.value;
  };

  handleDrag = (event, dd) => {
    const delta = event[this.deltaDimension];
    const { max = 100, min = 0, step = 1 } = this.props;
    this.handleChange(dd.originalValue + Math.round(delta / this.clientSize * (max - min) / step) * step);
  };

  handleChange = _.throttle(n => {
    this.props.onChange && this.props.onChange(n);
  }, 50);

  render() {
    const { max, size, min = 0, value } = this.props;
    if (size >= max - min) return null;

    return (
      <div
        className="scrollbar"
        ref={this.refContainer}
        style={{
          position: "absolute",
          zIndex: ~(1 << 31),
          right: 0,
          bottom: 0,
          background: "#eee",
          display: "flex",
          ...this.style
        }}
      >
        <div
          style={{
            flex: 0,
            flexBasis: value / max * 100 + "%"
          }}
          onMouseDown={() => this.handleChange(value - size)}
        />
        <Draggable
          style={{
            background: "rgba(128,128,128,0.5)",
            flex: 0,
            flexBasis: size / max * 100 + "%"
          }}
          onDragStart={this.handleDragStart}
          onDrag={this.handleDrag}
        />
        <div
          style={{
            flex: 1
          }}
          onMouseDown={() => this.handleChange(value + size)}
        />
      </div>
    );
  }

  refContainer = el => {
    if (!el) return;
    if (this.observer) this.observer.disconnect();
    this.observer = new window.ResizeObserver(entries => {
      this.clientSize = el[this.clientDimension];
    });
    this.observer.observe(el);
  };
}
