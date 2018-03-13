import React from "react";
import { observable, computed } from "mobx";
import { observer } from "mobx-react";

import { CollectionGrid } from "../lib/CollectionGrid.js";
import { ListStore } from "./ListStore.js";

@observer
export class ListGrid extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { records, fields, labelKey } = props;
    this.store = new ListStore({ records, fields, labelKey });
  }
  render() {
    const { records, fields, labelKey, ...rest } = this.props;
    return <CollectionGrid store={this.store} {...rest} />;
  }

}
