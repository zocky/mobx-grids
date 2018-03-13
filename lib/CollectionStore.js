import { observable, computed, reaction } from "mobx";

import { ColumnStore } from "./ColumnStore";

export class CollectionStore {
  @observable rows = [];
  @observable records = [];
  @observable selectable = false;

  constructor({ onCurrent, records = [], selectable, fields = {}, rowKey, labelKey, columnOrder }) {
    this.records = this.records.concat(records);
    this.selectable = selectable;
    this.labelKey = labelKey;
    this.rowKey = rowKey;
    this.columnStore = new ColumnStore({ fields, labelKey, columnOrder });
    if (onCurrent) {
      reaction(() => this.currentRecord, onCurrent, {
        fireImmediately: true,
        delay: 100
      });
    }
  }

  get columns() {
    return this.columnStore.columns;
  }

  get allColumns() {
    return this.columnStore.allColumns;
  }

  get labelColumn() {
    return this.columnStore.labelColumn;
  }

  @computed
  get sortColumn() {
    return this.columnStore.sortColumn;
  }

  @computed
  get sortOrder() {
    return this.columnStore.sortOrder;
  }

  @observable currentRow = null;

  @computed
  get currentRecord() {
    return this.currentRow && this.currentRow.record;
  }

  @computed
  get currentIndex() {
    return this.rows.indexOf(this.currentRow);
  }

  set currentIndex(n) {
    const index = Math.min(Math.max(n, 0), this.rows.length - 1);
    this.currentRow = this.rows[index];
  }

  @computed
  get isFiltered() {
    return this.allColumns.some(column => !!column.filter);
  }

  @observable filterEnabled = false;

  @computed
  get statusText() {
    return [];
  }
}

export class CollectionRow {
  @observable depth = 0;
  @observable hasToggle = false;
  @observable _selected = false;

  constructor({ store, record, selected = false }) {
    this.store = store;
    this.record = record;
    this._selected = selected;
  }

  @computed
  get selectState() {
    return this.selected;
  }

  @computed
  get selected() {
    return this._selected;
  }

  set selected(val) {
    this._selected = !!val;
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  @computed
  get key() {
    return this.record[this.store.rowKey];
  }
}
