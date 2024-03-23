import React from "react";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Box, Stack } from "@mui/material";
import axios from "axios";
import TableView from "../TabelView";
import SearchBox from "../SearchBar";
import ActionsArea from "../ActionsArea";
import config from "../.././config.json";

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
    searchUser();
  }, [search]);

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

  const searchUser = () => {
    const filteredUsers = users.filter((user) => {
      const searchPattern = new RegExp(search, "i");

      if (user.name.search(searchPattern) !== -1) return true;
      if (user.email.search(searchPattern) !== -1) return true;
      if (user.role.search(searchPattern) !== -1) return true;

      return false;
    });

    setFound(filteredUsers);
  };

  const handleDelete = (id) => {
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

  const loadEditData = (id) => {
    const userIndex = users.findIndex((user) => user.id === id);
    const user = users[userIndex];

    setEditData({ ...editData, [id]: { ...user } });
  };

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

  const editUserData = (id) => {
    if (selectedEdit.has(id)) {
      modifiedData(id);
      enqueueSnackbar(`User Record with id=${id} has been updated!`, {
        variant: "warning",
      });
      return;
    }

    const newSelectedEdit = new Set(selectedEdit);
    newSelectedEdit.add(id);
    setSelectedEdit(newSelectedEdit);

    loadEditData(id);
  };

  const handleEditChange = (e, id, key) => {
    setEditData({
      ...editData,
      [id]: { ...editData[id], [key]: e.target.value },
    });
  };

  const handleCheckboxClick = (e, id) => {
    let newSelected = new Set(selected);

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

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
