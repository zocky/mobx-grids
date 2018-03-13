import { action, observable, computed } from "mobx";

import { CollectionRow, CollectionStore } from "../lib/CollectionStore.js";

const empty = val => !val && val !== 0;

export class GenericTreeStore extends CollectionStore {
  // this tells the grid component(s) that this store represents a tree
  isTree = true;

  Row = TreeRow;

  constructor({ leafSelectState, ...rest }) {
    super(rest);
    this.leafSelectState = leafSelectState || (row => row.selected);
  }

  @computed
  get rootRow() {
    return new this.Row({ store: this });
  }

  @computed
  get rows() {
    return this.rootRow.rows;
  }

  @computed
  get selectState() {
    return this.rootRow.selectState;
  }

  @action
  selectAll() {
    this.rootRow.selected = true;
  }

  @action
  deselectAll() {
    this.rootRow.selected = false;
  }

  getChildRecords(record) {
    return [];
  }
}

export class TreeStore extends GenericTreeStore {
  constructor({ parentKey, ...rest }) {
    super(rest);
    this.parentKey = parentKey;
  }
  getChildRecords(record) {
    if (record) return this.records.filter(r => r[this.parentKey] === record[this.rowKey]);
    else return this.records.filter(r => empty(r[this.parentKey]));
  }
}

export class TreeRow extends CollectionRow {
  @observable expanded = false;
  @observable children = [];

  @computed
  get depth() {
    if (!this.parent) return 0;
    return this.parent.depth + 1;
  }

  constructor({ parent = null, depth = 0, ...rest }) {
    super(rest);

    this.parent = parent;
    if (!this.record) this.expanded = true;

    const Row = this.constructor;

    const childRecords = this.store.getChildRecords(this.record);
    this.children = childRecords.map(record => new Row({ record, store: this.store, parent: this }));
  }

  @computed
  get filteredChildren() {
    return this.children.filter(child => this.store.columnStore.filterRow(child) || child.filteredChildren.length > 0);
  }

  @computed
  get sortedChildren() {
    return this.store.columnStore.sortRows(this.filteredChildren);
  }

  @computed
  get rows() {
    var ret = this.record ? [this] : [];
    if (this.expanded || this.store.isFiltered) ret = ret.concat(...this.sortedChildren.map(child => child.rows));
    return ret;
  }

  @computed
  get isLeaf() {
    return this.children.length === 0;
  }

  @computed
  get hasToggle() {
    return !this.isLeaf;
  }

  expand = () => (this.expanded = !this.isLeaf);
  collapse = () => (this.expanded = false);
  toggle = () => (this.expanded = !this.isLeaf && !this.expanded);

  @computed
  get selectState() {
    //if (this.isLeaf) return this.store.leafSelectState(this);
    var state = undefined;
    for (const child of this.selectionChildren) {
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

  @computed
  get selectionChildren() {
    if (this.isLeaf) return [];
    if (!this.store.isFiltered) return this.children;
    if (this.filteredChildren.length > 0) return this.filteredChildren;
    return this.children;
  }

  @computed
  get selected() {
    return this._selected;
  }

  set selected(val) {
    if (false && this.isLeaf) this._selected = !!val;
    else this.selectionChildren.forEach(child => (child.selected = !!val));
  }

  toggleSelected() {
    this.selected = !this.selectState;
  }
}
