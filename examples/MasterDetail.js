import React from "react";

import {
  treeRecords,
  treeFields,
  listRecords,
  listFields
} from "../data/Data.js";

import { ListStore } from "../List/ListStore.js";
import { UnionTreeStore, MasterTreeStore } from "../Tree/MasterTreeStore.js";
import { CollectionGrid } from "../lib/CollectionGrid.js";

import { observable, computed } from "mobx";
import { observer } from "mobx-react";

const detailStore = new ListStore({
  records: listRecords,
  fields: listFields,
  labelKey: "name",
  rowKey: "index"
});

const masterStore = new UnionTreeStore({
  records: treeRecords,
  fields: treeFields,
  labelKey: "company",
  rowKey: "index",
  parentKey: "parent",
  detailStore: detailStore,
  detailKey: "company"
});

@observer
class ExplorerGrid extends React.Component {
  @observable list = null;
  constructor(props, context) {
    super(props, context);
    this.detailStore = props.detailStore;
    this.masterStore = props.masterStore;
  }

  masterFilter = master => detail => master && master.index === detail.company;

  render() {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: "flex",
          flexFlow: "row"
        }}
      >
        <CollectionGrid
          style={{
            flex: "1 1 0"
          }}
          store={this.masterStore}
          selectable
        />
        <CollectionGrid
          style={{
            flex: "1 1 0"
          }}
          store={this.detailStore}
          selectable
        />
      </div>
    );
  }
}

const Example = () => (
  <ExplorerGrid detailStore={detailStore} masterStore={masterStore} />
);
export default Example;
