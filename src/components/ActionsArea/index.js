import React from "react";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import { Button } from "@mui/material";

/**
 * Actions Area of our User List Table View
 * This page has DeleteButton, Pagination
 */

export default function ActionsArea({
  data,
  rowLimit,
  currentPage,
  setCurrentPage,
  handleDeleteSelected,
}) {
  const DeleteSelectedButton = ({ handleDeleteSelected }) => (
    <Button
      id="delete-selected-button"
      onClick={handleDeleteSelected}
      sx={{
        color: "common.white",
        bgcolor: "button.danger.main",
        "&:hover": {
          bgcolor: "button.danger.dark",
        },
      }}
    >
      DELETE SELECTED
    </Button>
  );

  /**
   * Pagination
   */

  const PaginationOperation = ({ dataLength, currentPage, rowLimit }) => (
    <Pagination
      page={currentPage}
      count={Math.ceil(dataLength / rowLimit)}
      color="primary"
      showFirstButton
      showLastButton
      sx={{
        alignSelf: "center",
      }}
      onChange={(event, page) => {
        setCurrentPage(page);
      }}
    />
  );

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems="strech"
      spacing={2}
      id="table-action-area"
    >
      <DeleteSelectedButton handleDeleteSelected={handleDeleteSelected} />

      <PaginationOperation
        dataLength={data.length}
        currentPage={currentPage}
        rowLimit={rowLimit}
      />
    </Stack>
  );
}
