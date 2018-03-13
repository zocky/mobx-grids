import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Draggable } from "./Draggable";

@observer
export class GridHeader extends React.Component {
  render() {
    const { grid } = this.props;
    return (
      <React.Fragment>
        <div className="titles" style={{ display: "contents" }}>
          <HeaderLabelCell grid={grid} />
          {grid.visibleColumns.map((column, idx) => <HeaderCell key={idx} grid={grid} column={column} />)}
        </div>
        {grid.store.filterEnabled ? (
          <div className="filters" style={{ display: "contents" }}>
            <FilterCell grid={grid} column={grid.store.labelColumn} />
            {grid.visibleColumns.map((column, idx) => <FilterCell key={idx} grid={grid} column={column} />)}
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

@observer
export class FilterCell extends React.Component {
  handleChange = event => {
    this.props.column.setFilter(event.target.value);
    this.props.grid.scrollToCurrent();
  };
  handleClear = event => {
    this.props.column.setFilter("");
    this.props.grid.scrollToCurrent();
  };

  render() {
    const { grid, column } = this.props;
    return (
      <div className="cell">
        <input className="filter" type="text" value={column.filter} onChange={this.handleChange} />
        <span className="clear" onClick={this.handleClear} />
      </div>
    );
  }
}

@observer
export class HeaderLabelCell extends React.Component {
  @observable element = null;
  refCell = el => {
    this.element = el;
  };
  handleClick = event => {
    this.props.grid.store.labelColumn.setSort();
    this.props.grid.scrollToCurrent();
  };

  render() {
    const grid = this.props.grid;
    const column = grid.store.labelColumn;
    return (
      <React.Fragment>
        <div ref={this.refCell} className="label cell" onMouseDown={this.handleClick} sort-order={column.sortOrder}>
          <span className="title">
            {grid.props.selectable ? <HeaderLabelCheckbox grid={grid} /> : null}
            {column.title}
          </span>
          <ColumnSizer column={column} element={this.element} />
        </div>
      </React.Fragment>
    );
  }
}

class ColumnSizer extends React.PureComponent {
  render() {
    return (
      <Draggable
        onDragStart={(event, dd) => {
          dd.width = this.props.element.clientWidth;
        }}
        onDrag={(event, dd) => {
          this.props.column.width = dd.width + event.deltaX;
        }}
        onDragEnd={(event, dd) => {
          this.props.column.width = this.props.element.clientWidth;
        }}
        className="sizer"
        cursor="col-resize"
      />
    );
  }
}

@observer
export class HeaderCell extends React.Component {
  @observable element = null;
  refCell = el => {
    this.element = el;
  };
  handleClick = () => {
    this.props.column.setSort();
    this.props.grid.scrollToCurrent();
  };

  render() {
    const { grid, column } = this.props;
    return (
      <div
        ref={this.refCell}
        className="cell"
        onMouseDown={this.handleClick}
        sort-order={column.sortOrder}
        cell-align={column.field.align}
      >
        <span className="title">{column.title}</span>
        <ColumnSizer column={column} element={this.element} />
      </div>
    );
  }
}

@observer
class HeaderLabelCheckbox extends React.Component {
  @computed
  get selectClass() {
    const { grid } = this.props;
    switch (grid.store.selectState) {
      case true:
        return "selected";
      case false:
        return "";
      default:
        return "indeterminate";
    }
  }

  handleClick = event => {
    const { grid } = this.props;
    if (grid.store.selectState) grid.store.deselectAll();
    else grid.store.selectAll();
    event.preventDefault();
    event.stopPropagation();
  };
  render() {
    return <span onMouseDown={this.handleClick} className={"checkbox " + this.selectClass} />;
  }
}
