import React from "react";

import {
  treeRecords,
  treeFields,
  listRecords,
  listFields
} from "../data/Data.js";

import { ListStore } from "../List/ListStore.js";
import { CollectionGrid } from "../lib/CollectionGrid.js";

import { observable, computed } from "mobx";
import { observer } from "mobx-react";

const listStore = new ListStore({
  records: listRecords,
  fields: listFields,
  labelKey: "name",
  rowKey: "index"
});

@observer
class Example extends React.Component {
  render() {
    return (
      <CollectionGrid
        style={{ position: "fixed", top: 0, left: 0, bottom: 0, right: 0 }}
        store={listStore}
        selectable
      />
    );
  }
}

export default Example;
