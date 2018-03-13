import { observable, computed, reaction } from "mobx";

import { TreeRow, TreeStore } from "./TreeStore.js";

const empty = val => !val && val !== 0;

export class MasterTreeStore extends TreeStore {
  Row = MasterTreeRow;
  constructor({ detailStore, detailKey, detailFilter, ...rest }) {
    super(rest);

    this.detailStore = detailStore;
    this.detailKey = detailKey;
    this.detailFilter = detailFilter;

    reaction(
      () => this.currentRow,
      master => {
        this.detailStore.globalFilter = this.currentRow.detailFilter;
      }
    );
  }

  detailFilterFor = row => {
    if (this.detailFilter) return this.detailFilter(row.record);
    return detail => row && row.record && row.record[this.rowKey] === detail[this.detailKey];
  };
}

class MasterTreeRow extends TreeRow {
  @computed
  get detailFilter() {
    return this.store.detailFilterFor(this);
  }

  @computed
  get details() {
    return this.store.detailStore.storedRows.filter(row => this.detailFilter(row.record));
  }

  @computed
  get selectionChildren() {
    if (this.isLeaf) return this.details;
    if (!this.store.isFiltered) return [...this.children, ...this.details];
    if (this.filteredChildren.length > 0) return [...this.filteredChildren, ...this.details];
    return [...this.children, ...this.details];
  }
}

export class UnionTreeStore extends MasterTreeStore {
  Row = UnionTreeRow;
  detailFilterFor = row => {
    if (row.isLeaf) {
      if (this.detailFilter) return this.detailFilter(row.record);
      return detail => row && row.record && row.record[this.rowKey] === detail[this.detailKey];
    } else {
      return detail => row.children.some(child => child.details.some(cd => cd.record === detail));
    }
  };
}

class UnionTreeRow extends MasterTreeRow {
  @computed
  get selectionChildren() {
    return this.details;
  }
}
