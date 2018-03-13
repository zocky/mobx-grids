import { observable, computed, action } from "mobx";

import { CollectionStore, CollectionRow } from "../lib/CollectionStore.js";

export class ListStore extends CollectionStore {
  constructor({ ...rest }) {
    super({ ...rest });
  }

  @observable _globalFilter = null;

  @computed
  get globalFilter() {
    return this._globalFilter;
  }

  set globalFilter(fn) {
    this._globalFilter = fn;
  }

  @computed
  get storedRows() {
    return this.records.map(record => new ListRow({ store: this, record }));
  }

  @computed
  get allRows() {
    if (!this.globalFilter) return this.storedRows;
    return this.storedRows.filter(row => this.globalFilter(row.record));
  }

  @computed
  get filteredRows() {
    if (!this.filterEnabled) return this.allRows;
    return this.columnStore.filterRows(this.allRows);
  }

  @computed
  get rows() {
    if (this.sortColumn) return this.columnStore.sortRows(this.filteredRows);
    return this.filteredRows;
  }

  @computed
  get totalCount() {
    return this.allRows.length;
  }

  @computed
  get filteredCount() {
    return this.filteredRows.length;
  }

  @computed
  get selectedCount() {
    return this.selectedRows.length;
  }

  @computed
  get selectedFilteredCount() {
    return this.selectedFilteredRows.length;
  }

  @computed
  get selectedRows() {
    return this.allRows.filter(row => row.selected);
  }

  @computed
  get selectedFilteredRows() {
    return this.filteredRows.filter(row => row.selected);
  }

  @computed
  get selectState() {
    var state = undefined;
    for (const child of this.filteredRows) {
      const childState = child.selectState;
      if (childState === undefined) return undefined;
      if (state === undefined) {
        state = childState;
        continue;
      }
      if (state !== childState) return undefined;
    }
    return state;
  }

  selectAll() {
    this.filteredRows.forEach(row => (row.selected = true));
  }
  deselectAll() {
    this.filteredRows.forEach(row => (row.selected = false));
  }

  @computed
  get statusText() {
    const ret = [];
    if (this.filterEnabled) {
      ret.push(`${this.filteredCount} of ${this.totalCount} items`);
    } else {
      ret.push(`${this.totalCount} items`);
    }
    if (this.selectedCount > 0) {
      if (this.filterEnabled) {
        ret.push(`${this.selectedCount} selected (${this.selectedCount - this.selectedFilteredCount} hidden)`);
      } else {
        ret.push(`${this.selectedCount} selected`);
      }
    }
    return ret;
  }
}

export class ListRow extends CollectionRow {}
