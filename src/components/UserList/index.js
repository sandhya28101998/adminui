import React from "react";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Box, Stack } from "@mui/material";
import axios from "axios";
import TableView from "../TabelView";
import ActionsArea from "../ActionsArea";
import config from "../../config.json";
import SearchBox from "../SearchBar";

/**
 * @typedef User
 * @type {object}
 * @property {number} id - User ID.
 * @property {string} name - User Name.
 * @property {string} email - User Email.
 * @property {string} role - User Role.
 */

const UserList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [rowLimit, setRowLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [found, setFound] = useState([]);
  const [selectedEdit, setSelectedEdit] = useState(new Set());
  const [editData, setEditData] = useState({});
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const searchUser = () => {
      /**
       * Search users in all field
       * @param {User} User
       * @return {boolean}
       */

      const filteredUsers = users.filter((user) => {
        // String.search(pattern) -> This will search if any pattern matches
        // It returns -1 -> if string not found, else 0...n for first find
        const searchPattern = new RegExp(search, "i");

        // Search all the fields
        if (user.name.search(searchPattern) !== -1) return true;
        if (user.email.search(searchPattern) !== -1) return true;
        if (user.role.search(searchPattern) !== -1) return true;

        return false;
      });

      setFound(filteredUsers);
    };
    searchUser();
    setRowLimit(10);
  }, [search, users]);

  const fetchData = async () => {
    const baseUrl = `${config.endpoint}`;

    try {
      const response = await axios.get(baseUrl);

      if (!response.status === 200) setUsers([]);

      setUsers(response.data);
    } catch (e) {
      console.log(e);
      setUsers([]);
    }
  };

  /**
   * Function to perform search based on 'search' prop's state change.
   */

  /**
   * Delete handle for each record in Table View
   *
   * @param {number} id User ID
   * @returns {undefined}
   */

  const handleDelete = (id) => {
    // Get same array without the selected user (deletes it)
    const filteredUsers = users.filter((user) => user.id !== id);
    const filteredSearchResults = found.filter((user) => user.id !== id);

    try {
      setUsers(filteredUsers);
      setFound(filteredSearchResults);
      enqueueSnackbar(`User Record with id=${id} has been deleted!`, {
        variant: "error",
      });
      return;
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Loads the current record data from users with userId
   *
   * @param {number} id User ID
   * @returns {undefined}
   */

  const loadEditData = (id) => {
    const userIndex = users.findIndex((user) => user.id === id);
    const user = users[userIndex];

    setEditData({ ...editData, [id]: { ...user } });
  };

  /**
   *
   * Changes in user data happens in-memory
   *
   * @param {number} id userId
   * @returns {undefined}
   */

  const modifiedData = (id) => {
    const dataIndex = users.findIndex((user) => user.id === id);

    if (dataIndex === -1) return;

    try {
      const newUsers = [...users];

      newUsers[dataIndex]["name"] = editData[id].name;
      newUsers[dataIndex]["email"] = editData[id].email;
      newUsers[dataIndex]["role"] = editData[id].role;

      setUsers(newUsers);
    } catch (e) {
      console.log(e);
    } finally {
      const newSelectedEdit = new Set(selectedEdit);

      newSelectedEdit.delete(id);

      setSelectedEdit(newSelectedEdit);
    }
  };

  /**
   * Edit Handle to enable / disable the edit mode
   *
   * @param {number} id userId
   * @returns {undefined}
   */

  const editUserData = (id) => {
    if (selectedEdit.has(id)) {
      modifiedData(id);
      enqueueSnackbar(`User Record with id=${id} has been updated!`, {
        variant: "warning",
      });
      return;
    }

    // Open Edit functionality
    const newSelectedEdit = new Set(selectedEdit);
    newSelectedEdit.add(id);
    setSelectedEdit(newSelectedEdit);

    loadEditData(id);
  };

  /**
   * Handles changes of records which are open in edit Mode
   *
   * @param {object} e
   * @param {number} id userID
   * @param {string} key field of User record to be updated
   * @returns {undefined}
   */

  const handleEditChange = (e, id, key) => {
    setEditData({
      ...editData,
      [id]: { ...editData[id], [key]: e.target.value },
    });
  };

  /**
   * checkbox click and update
   * add / remove clicked record
   *
   * @param {number} id userId
   * @returns {undefined}
   */

  const handleCheckboxClick = (e, id) => {
    let newSelected = new Set(selected);

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  /**
   * Adds / removes all the current page rows to selected
   *
   * @param {object} event window Event object
   * @returns {undefined}
   */

  const SelectAllClick = (event) => {
    const low = (currentPage - 1) * rowLimit;
    const high = currentPage * rowLimit;

    let tempUsers = [...(search.length === 0 ? users : found)];
    tempUsers = tempUsers.slice(low, high);

    console.log(event.target.checked);
    let newSelected = new Set(selected);
    for (let i = 0; i < tempUsers.length; i++) {
      if (event.target.checked) {
        newSelected.add(tempUsers[i].id);
      } else {
        newSelected.delete(tempUsers[i].id);
      }
    }

    setSelected(newSelected);
  };

  // handle to Delete Current Selected User Row

  const handleDeleteSelected = () => {
    let deletetedCount = users.length;
    const filteredUsers = users.filter((user) => !selected.has(user.id));
    deletetedCount -= filteredUsers.length;
    const filteredSearchResults = found.filter(
      (user) => !selected.has(user.id)
    );

    try {
      setUsers(filteredUsers);
      setFound(filteredSearchResults);
      enqueueSnackbar(
        `${deletetedCount} User Records been deleted Successfully!`,
        {
          variant: "error",
        }
      );
    } catch (e) {
      console.log(e);
    } finally {
      setSelected(new Set());
    }
  };

  //  Main component
  return (
    <Stack
      className="user-list-container"
      direction="column"
      justifyContent="space-between"
      spacing={2}
    >
      <Box className="user-list-search-bar-container">
        <SearchBox search={search} setSearch={setSearch} />
      </Box>

      <Box className="user-list-table-view-container">
        <TableView
          data={search.length === 0 ? users : found}
          currentPage={currentPage}
          rowLimit={rowLimit}
          selected={selected}
          selectedEdit={selectedEdit}
          editData={editData}
          handleEdit={editUserData}
          handleEditChange={handleEditChange}
          handleDelete={handleDelete}
          handleCheckboxClick={handleCheckboxClick}
          handleSelectAllClick={SelectAllClick}
        />
      </Box>

      <Box className="user-list-table-actions-container">
        <ActionsArea
          data={search.length === 0 ? users : found}
          rowLimit={rowLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleDeleteSelected={handleDeleteSelected}
        />
      </Box>
    </Stack>
  );
};

export default UserList;
