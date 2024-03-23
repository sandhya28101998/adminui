import React from "react";

import "./searchBar.css";
export default function SearchBox({ search, setSearch }) {
  return (
    <input
      id="user-list-search-bar"
      placeholder="Search..."
      type="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
