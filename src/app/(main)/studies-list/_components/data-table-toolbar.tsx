"use client";

import * as React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { statusesTypes } from "../types/statuses-types";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const studyUuidColumn = table.getColumn("study_uuid");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (studyUuidColumn) {
      studyUuidColumn.setFilterValue(value);
    }
  };

  return (
    <div
      className="flex items-center justify-between"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-1 items-center space-x-2">
        <div className="w-[150px] lg:w-[250px]">
          <Input
            placeholder="Filtrar por accession number..."
            value={(studyUuidColumn?.getFilterValue() as string) || ""}
            onChange={handleInputChange}
            className="h-8"
            autoComplete="off"
            disabled={!studyUuidColumn}
          />
        </div>
        {table.getColumn("study_status") && (
          <DataTableFacetedFilter
            column={table.getColumn("study_status")}
            title="Estado"
            options={statusesTypes}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
