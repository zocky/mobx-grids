import React from "react";
import { observable, computed } from "mobx";
import { observer } from "mobx-react";

import { CollectionGrid } from "../lib/CollectionGrid.js";
import { TreeStore } from "./TreeStore.js";

@observer
export class TreeGrid extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { onCurrent, records, fields, labelKey, rowKey, parentKey, leafSelectState } = props;
    this.store = new TreeStore({ onCurrent, records, fields, labelKey, rowKey, parentKey, leafSelectState });
  }

  render() {
    const { records, fields, labelKey, ...rest } = this.props;
    return <CollectionGrid {...rest} store={this.store} actions={this.actions} keyBindings={this.keyBindings} />;
  }

  actions = {
    MOVE_NODE_OUT: () => {
      if (this.store.currentRow.expanded) this.store.currentRow.collapse();
      else if (this.store.currentRow.parent !== this.store.rootRow)
        this.store.currentRow = this.store.currentRow.parent;
    },
    MOVE_NODE_IN: () => {
      if (!this.store.currentRow.expanded) this.store.currentRow.expand();
      else if (!this.store.currentRow.isLeaf) this.store.currentRow = this.store.currentRow.children[0];
    }
  };

  keyBindings = {
    ArrowLeft: "MOVE_NODE_OUT",
    ArrowRight: "MOVE_NODE_IN"
  };
}
