import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";

@observer
export class GridRow extends React.Component {
  get grid() {
    return this.props.grid;
  }
  get index() {
    return this.props.index;
  }
  @computed
  get columns() {
    return this.grid.visibleColumns;
  }
  get labelColumn() {
    return this.grid.store.labelColumn;
  }

  get isTreeNode() {
    return this.grid.store.isTree;
  }

  get isSelectable() {
    return this.grid.props.selectable;
  }

  @computed
  get row() {
    return this.grid.rowAt(this.index);
  }

  @computed
  get isEmpty() {
    return this.props.index + this.props.grid.realScrollTop >= this.props.grid.rows.length;
  }

  @computed
  get isCurrent() {
    return this.props.grid.currentVisibleIndex === this.props.index;
  }

  @computed
  get isExpanded() {
    return this.row ? this.row.expanded : false;
  }

  @computed
  get isLeaf() {
    return this.row ? this.row.isLeaf : true;
  }

  @computed
  get selectState() {
    return this.row && this.row.selectState;
  }

  toggleExpanded = event => {
    if (!this.isTreeNode) return;
    this.row && this.row.toggle();
    event.preventDefault();
    event.stopPropagation();
  };

  toggleSelected = event => {
    if (!this.isSelectable) return;
    this.row && this.row.toggleSelected();
    event.preventDefault();
    event.stopPropagation();
  };

  setCurrent = () => {
    this.grid.currentVisibleIndex = this.index;
  };

  @computed
  get indent() {
    return (this.row && this.row.depth) | 0;
  }

  render() {
    return (
      <div style={{ display: "contents" }} className={"row"} onMouseDown={this.setCurrent}>
        <RowMarker gridRow={this} />
        <LabelCell gridRow={this} />
        {this.columns.map((column, idx) => <Cell key={idx} gridRow={this} column={column} />)}
      </div>
    );
  }
}

@observer
class RowMarker extends React.Component {
  render() {
    const { gridRow } = this.props;
    if (gridRow.isEmpty) return <span style={{ display: "none" }} className="row-marker empty" />;
    if (gridRow.isCurrent) return <span style={{ display: "none" }} className="row-marker current" />;
    return null;
  }
}

class LabelCell extends React.PureComponent {
  render() {
    const { gridRow } = this.props;
    return (
      <div className="label cell">
        {gridRow.isTreeNode ? (
          <React.Fragment>
            <LabelSpacer gridRow={gridRow} />
            <LabelToggle gridRow={gridRow} />
          </React.Fragment>
        ) : null}
        {gridRow.isSelectable ? <LabelCheckbox gridRow={gridRow} /> : null}
        <span className="value">
          <CellValue column={gridRow.labelColumn} gridRow={gridRow} />
        </span>
      </div>
    );
  }
}

@observer
class LabelSpacer extends React.Component {
  render() {
    const { gridRow } = this.props;
    return <span className="spacer" style={{ display: "inline-block", width: gridRow.indent + "em" }} />;
  }
}

@observer
class LabelToggle extends React.Component {
  render() {
    const { gridRow } = this.props;
    return gridRow.isLeaf ? (
      <span className="toggle leaf" />
    ) : gridRow.isExpanded ? (
      <span className="toggle expanded" onMouseDown={gridRow.toggleExpanded} />
    ) : (
      <span className="toggle collapsed" onMouseDown={gridRow.toggleExpanded} />
    );
  }
}

@observer
class LabelCheckbox extends React.Component {
  @computed
  get selectClass() {
    const { gridRow } = this.props;
    switch (gridRow.selectState) {
      case true:
        return "selected";
      case false:
        return "";
      default:
        return "indeterminate";
    }
  }

  render() {
    const { gridRow } = this.props;
    return <span className={"checkbox " + this.selectClass} onMouseDown={gridRow.toggleSelected} />;
  }
}

class Cell extends React.PureComponent {
  render() {
    const { gridRow, column } = this.props;
    return (
      <div className="cell" cell-align={column.field.align}>
        <span className="value">
          <CellValue gridRow={gridRow} column={column} />
        </span>
      </div>
    );
  }
}

@observer
export class CellValue extends React.Component {
  @computed
  get formatted() {
    const { gridRow, column } = this.props;
    const val = gridRow.row ? column.format(gridRow.row) : null;
    return val === undefined ? null : val;
  }
  render() {
    return this.formatted;
  }
}
