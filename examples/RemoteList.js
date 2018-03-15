import React from "react";
import { observable, computed, action, reaction, when } from "mobx";
import { observer } from "mobx-react";
import { Route, NavLink } from "react-simpler-router";

import { observerWithProps } from "../lib/utils";

import { ListStore } from "../List/ListStore.js";
import { CollectionGrid } from "../lib/CollectionGrid.js";

import "./examples.css";

@observerWithProps({
  find: "ace"
})
class ExampleList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.listStore = new ListStore({
      fields: {
        name: {},
        latest: {}
      },
      labelKey: "name",
      rowKey: "name",
      records: [],
      loadRecords: this.load
    });
    reaction(() => this.find, () => this.listStore.loadRecords());
  }
  componentDidMount() {}

  load = () => {
    console.log("load", this.find);
    return fetch("https://api.cdnjs.com/libraries?search=" + this.find)
      .then(res => res.json())
      .then(data => data.results);
  };

  render() {
    return (
      <CollectionGrid style={{ flex: 1 }} store={this.listStore} selectable />
    );
  }
}

@observerWithProps({})
class Example extends React.Component {
  render() {
    return (
      <div className="extend flex-column">
        <div className="ui top attached inverted menu">
          <NavLink className="link item" to="/home" />
          <NavLink className="link item" to="/search/jquery" />
          <NavLink className="link item" to="/search/semantic" />
        </div>
        <Route path="/home">Home</Route>
        <Route path="search/:find">
          <ExampleList />
        </Route>
      </div>
    );
  }
}

export default Example;
