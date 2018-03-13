import { observable, computed, action, reaction } from "mobx";
import React from "react";

export class ColumnStore {
  @observable fields = {};
  @observable columnOrder = [];

  constructor({ store, fields, labelKey, columnOrder }) {
    this.store = store;
    for (const [k, field] of Object.entries(fields)) {
      const key = field.key || k;
      this.fields[key] = Object.assign({}, field, { key });
    }
    this.labelKey = labelKey;
    if (!this.fields[this.labelKey]) throw `Label key ${labelKey} not found.`;
    this.labelColumn = new Column({ store: this, field: this.fields[this.labelKey] });
    this.columnOrder = columnOrder || Object.keys(this.fields).filter(key => key !== labelKey);
  }

  @computed
  get columns() {
    return this.columnOrder.map(key => new Column({ store: this, field: this.fields[key] }));
  }

  @computed
  get visibleColumns() {
    return this.columns.filter(column => !column.isHidden);
  }

  @computed
  get allColumns() {
    return [this.labelColumn].concat(this.visibleColumns);
  }

  @observable labelColumn = null;

  @observable sortColumn = null;
  @observable sortOrder = 1;

  @action
  setSort(column) {
    if (this.sortColumn === column) {
      if (this.sortOrder === 1) this.sortOrder = -1;
      else this.sortColumn = null;
    } else {
      this.sortColumn = column;
      this.sortOrder = 1;
    }
  }

  sortRows(rows) {
    if (!this.sortColumn) return rows;
    return this.sortColumn.sortRows(rows, this.sortOrder);
  }

  filterRow(row) {
    return this.labelColumn.filterRow(row) && this.columns.every(column => column.filterRow(row));
  }
  filterRows(rows) {
    return this.columns.reduce((rows, column) => column.filterRows(rows), this.labelColumn.filterRows(rows));
  }
}

export class Column {
  @observable filter = "";
  @observable field = {};
  @observable isHidden = false;
  @observable width = null;
  @observable minWidth = 50;

  constructor({ store, field }) {
    this.store = store;
    this.field = Object.assign({}, ColumnTypes[field.type], field);
    this.title = field.title || field.key;
    this.width = this.field.width || null;
    this.minWidth = this.field.minWidth || 50;
  }

  compare = (a, b) => {
    if (this.field.compare) return this.field.compare(a, b);
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };

  sortRows = (rows, order = 1) => {
    const sorted = rows.concat();
    sorted.sort((a, b) => this.compare(this.value(a), this.value(b)));
    if (order < 0) sorted.reverse();
    return sorted;
  };

  filterValue = val =>
    String(val)
      .toLowerCase()
      .indexOf(this.filter.toLowerCase()) >= 0;

  filterRow = row => {
    if (!this.filter) return true;
    return this.filterValue(this.value(row));
  };

  filterRows = rows => {
    if (!this.filter) return rows;
    return rows.filter(row => this.filterRow(row));
  };

  getter = row => {
    return this.field.getter ? this.field.getter(row.record, this.field.key) : row.record[this.field.key];
  };

  value = row => {
    return this.field.value ? this.field.value(this.getter(row)) : this.getter(row);
  };

  format = row => {
    return this.field.formatter ? this.field.formatter(this.value(row), row, this.field.key) : this.value(row);
  };

  @action
  setSort = () => {
    this.store.setSort(this);
  };

  @action
  setFilter = f => {
    this.filter = f;
  };

  @computed
  get sortOrder() {
    if (this.store.sortColumn !== this) return 0;
    return this.store.sortOrder;
  }
}

export const ColumnTypes = {
  number: {
    align: "right",
    value: val => ((!val && val !== 0) || isNaN(val) ? null : +val),
    width: 100
  },
  image: {
    width: 50,
    formatter: val => (
      <div
        style={{
          height: "100%",
          backgroundImage: `url(${val})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center center"
        }}
      />
    )
  }
};
