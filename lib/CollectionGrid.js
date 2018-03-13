import React from "react";
import { observable, computed, action, reaction, toJS } from "mobx";
import { observer } from "mobx-react";

import { ScrollBar } from "./ScrollBar";
import { GridHeader } from "./GridHeader";
import { GridRow } from "./GridRow";

@observer
export class CollectionGrid extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { store, rowHeight, actions, keyBindings } = props;
    this.store = store;
    this.rowHeight = rowHeight || 32;

    Object.assign(this.actions, actions);
    for (const a in this.actions) this.actions[a] = action(this.actions[a]);
    Object.assign(this.keyBindings, keyBindings);
  }

  @observable scrollHeight = 10;
  @observable _scrollTop = 0;

  @computed
  get scrollTop() {
    return this._scrollTop;
  }
  set scrollTop(n) {
    this._scrollTop = Math.max(0, Math.min(n, this.rows.length - this.scrollHeight));
  }

  @computed
  get scrollBottom() {
    return this.scrollTop + this.scrollHeight - 1;
  }
  set scrollBottom(n) {
    this.scrollTop = n - this.scrollHeight + 1;
  }

  @action
  scrollTo = n => {
    if (typeof n !== "number") n = this.rows.indexOf(n);
    if (n < this.scrollTop) this.scrollTop = n;
    else if (n > this.scrollBottom) this.scrollBottom = n;
  };

  scrollToCurrent = () => {
    this.scrollTo(this.currentIndex);
  };

  @computed
  get rows() {
    return this.store.rows;
  }

  @computed
  get columns() {
    return this.store.columns;
  }

  @computed
  get visibleColumns() {
    return this.store.columnStore.visibleColumns;
  }

  @computed
  get currentRecord() {
    return this.store.currentRow && toJS(this.store.currentRow.record);
  }

  @computed
  get currentRow() {
    return this.store.currentRow;
  }

  set currentRow(row) {
    this.store.currentRow = row;
  }

  @computed
  get currentIndex() {
    return this.store.currentIndex;
  }

  set currentIndex(n) {
    this.store.currentIndex = n;
  }

  @computed
  get currentVisibleIndex() {
    return this.store.currentIndex - this.realScrollTop;
  }

  set currentVisibleIndex(n) {
    this.store.currentIndex = n + this.realScrollTop;
  }

  @computed
  get gridStyle() {
    const templateColumns = [];
    [this.store.labelColumn, ...this.visibleColumns].forEach(column => {
      const minWidth = column.minWidth ? column.minWidth + "px" : "50px";
      const maxWidth = column.width ? column.width + "px" : "1fr";
      templateColumns.push(`minmax(${minWidth},${maxWidth})`);
    });
    return {
      display: "grid",
      gridTemplateColumns: templateColumns.join(" "),
      gridAutoRows: this.rowHeight + "px",
      lineHeight: this.rowHeight + "px",
      verticalAlign: "middle"
    };
  }

  rowAt = n => {
    return this.rows[n + this.realScrollTop];
  };

  @observable overScan = 10;
  @computed
  get realScrollTop() {
    return Math.floor(this.scrollTop / this.overScan) * this.overScan - (this.overScan >> 1);
  }
  @computed
  get realScrollHeight() {
    return this.scrollHeight + 2 * this.overScan;
  }

  render() {
    return (
      <div
        className="ZA Grid"
        style={{
          display: "flex",
          flexFlow: "column",
          ...this.props.style
        }}
      >
        <div
          className="header"
          style={{
            ...this.gridStyle
          }}
        >
          <GridHeader grid={this} />
        </div>
        <div
          className="scroll"
          ref={this.refScrollContainer}
          tabIndex="1"
          style={{
            flex: 1,
            position: "relative",
            zIndex: "1",
            overflow: "hidden"
          }}
          onWheel={this.handleWheel}
          onKeyDown={this.handleKeyDown}
        >
          <GridScrollBar grid={this} />
          <GridMargin grid={this} />
          <div
            className="rows"
            style={{
              ...this.gridStyle
            }}
          >
            {[...Array(this.realScrollHeight)].map((_, index) => <GridRow key={index} grid={this} index={index} />)}
          </div>
        </div>
        <StatusBar grid={this} />
      </div>
    );
  }

  actions = {
    MOVE_TO_FIRST: () => (this.currentIndex = 0),
    MOVE_TO_LAST: () => (this.currentIndex = this.rows.length - 1),
    MOVE_ROW_UP: () => this.currentIndex--,
    MOVE_ROW_DOWN: () => this.currentIndex++,
    MOVE_PAGE_UP: () => (this.currentIndex -= this.scrollHeight),
    MOVE_PAGE_DOWN: () => (this.currentIndex += this.scrollHeight),
    SELECT_ROW: () => this.props.selectable && this.currentRow && this.currentRow.toggleSelected(),
    TOGGLE_FILTER: () => (this.store.filterEnabled = !this.store.filterEnabled),
    MOVE_NODE_OUT: () => {
      if (!this.store.isTree) return;
      if (this.store.currentRow.expanded) this.store.currentRow.collapse();
      else if (this.store.currentRow.parent !== this.store.rootRow)
        this.store.currentRow = this.store.currentRow.parent;
    },
    MOVE_NODE_IN: () => {
      if (!this.store.isTree) return;
      if (!this.store.currentRow.expanded) this.store.currentRow.expand();
      else if (!this.store.currentRow.isLeaf) this.store.currentRow = this.store.currentRow.children[0];
    }
  };

  keyBindings = {
    ArrowUp: "MOVE_ROW_UP",
    ArrowDown: "MOVE_ROW_DOWN",
    ArrowLeft: "MOVE_NODE_OUT",
    ArrowRight: "MOVE_NODE_IN",
    End: "MOVE_TO_LAST",
    Home: "MOVE_TO_FIRST",
    PageUp: "MOVE_PAGE_UP",
    PageDown: "MOVE_PAGE_DOWN",
    Space: "SELECT_ROW",
    CtrlF: "TOGGLE_FILTER"
  };

  handleKeyDown = event => {
    var key = "";
    if (event.altKey) key += "Alt";
    if (event.ctrlKey || event.metaKey) key += "Ctrl";
    if (event.shiftKey) key += "Shift";
    key += event.key === " " ? "Space" : event.key[0].toUpperCase() + event.key.substr(1);
    const action = this.keyBindings[key];
    if (!action) {
      console.log(key);
      return;
    }
    this.actions[action]();
    this.scrollToCurrent();
    event.preventDefault();
    event.stopPropagation();
  };

  handleWheel = event => {
    const delta = Math.round(event.deltaY * 3 / 100);
    this.scrollTop += delta;
  };

  refScrollContainer = el => {
    if (!el) return;
    if (this.observer) this.observer.disconnect();
    this.observer = new window.ResizeObserver(entries => {
      this.scrollHeight = Math.floor(el.clientHeight / this.rowHeight);
    });

    this.observer.observe(el);
  };
}

@observer
class GridMargin extends React.Component {
  render() {
    const { grid } = this.props;
    return (
      <div
        className="grid-margin"
        style={{ marginTop: grid.rowHeight * (grid.realScrollTop - grid.scrollTop) + "px" }}
      />
    );
  }
}

@observer
class GridScrollBar extends React.Component {
  render() {
    const grid = this.props.grid;
    return (
      <ScrollBar
        max={grid.rows.length}
        size={grid.scrollHeight}
        value={grid.scrollTop}
        onChange={n => (grid.scrollTop = n)}
      />
    );
  }
}

@observer
export class StatusBar extends React.Component {
  @computed
  get filterOn() {
    return this.props.grid.store.filterEnabled;
  }
  toggleFilter = event => {
    if (event.button === 0) {
      this.props.grid.store.filterEnabled = !this.props.grid.store.filterEnabled;
      this.props.grid.scrollToCurrent();
    }
    event.preventDefault();
    event.stopPropagation();
  };
  @observable columnsOn = false;

  toggleColumns = event => {
    if (event.button === 0) this.columnsOn = !this.columnsOn;
    event.stopPropagation();
  };

  toggleHideColumn = (event, column) => {
    if (event.button === 0) column.isHidden = !column.isHidden;
    event.preventDefault();
    event.stopPropagation();
  };

  isColumnHidden = column => {
    return column.isHidden;
  };

  render() {
    const store = this.props.grid.store;
    return (
      <div className="statusbar" style={{ position: "relative", zIndex: 2 }}>
        {store.statusText.map((text, index) => (
          <span key={index} className="area">
            {text}
          </span>
        ))}
        <span className="spacer" />
        <span className="toolbar">
          <span className={"filter button " + (this.filterOn ? "on" : "off")} onMouseDown={this.toggleFilter} />
          <span
            tabIndex="-1"
            style={{ position: "relative" }}
            className={"columns button " + (this.columnsOn ? "on" : "off")}
            onMouseDown={this.toggleColumns}
            onBlur={() => (this.columnsOn = false)}
          >
            {this.columnsOn ? (
              <div
                className="menu"
                style={{
                  position: "absolute",
                  bottom: "100%",
                  right: "0"
                }}
              >
                {store.columns.map((column, index) => (
                  <div className="item" key={index} onMouseDown={event => this.toggleHideColumn(event, column)}>
                    <span className={"checkbox " + (this.isColumnHidden(column) ? "" : " selected")} />
                    {column.title}
                  </div>
                ))}
              </div>
            ) : null}
          </span>
        </span>
      </div>
    );
  }
}
