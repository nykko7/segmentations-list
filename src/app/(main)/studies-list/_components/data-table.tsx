"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { ChevronRight, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Study } from "./columns";

interface DataTableProps<TData extends Study, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Study, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const toggleRowExpanded = React.useCallback((rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead></TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="group cursor-pointer"
                    onClick={() => toggleRowExpanded(row.id)}
                  >
                    <TableCell>
                      <ChevronRight
                        className={cn(
                          "transition group-hover:text-primary/80",
                          { "rotate-90": expandedRows[row.id] },
                          { "text-primary": expandedRows[row.id] },
                        )}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.id] && (
                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                      <TableCell colSpan={columns.length + 1}>
                        <div className="flex flex-col gap-y-2 p-4">
                          <h3 className="text-lg font-bold">
                            Revisar estudio:
                          </h3>
                          <div className="flex gap-3">
                            <Link
                              href={`https://segmai.scian.cl/pacs/ohif/viewer?StudyInstanceUIDs=${row.original.study_uuid}`}
                              target="_blank"
                            >
                              <Button variant="outline" className="gap-2">
                                <Image
                                  src={"/icons/ohif-icon-32x32.png"}
                                  alt={"ohif viewer icon"}
                                  width="25"
                                  height="25"
                                />
                                <span>OHIF Viewer</span>
                                <ChevronsRight className="h-5 w-5 rounded-full bg-primary/50" />
                              </Button>
                            </Link>
                          </div>
                          <h3 className="text-lg font-bold">
                            Información adicional:
                          </h3>
                          <ul className="list-inside list-disc">
                            <li>
                              <span className="font-bold">Study UUID:</span>{" "}
                              {row.original.study_uuid}
                            </li>
                            <li>
                              <span className="font-bold">Series:</span>
                              <ul className="ml-3 list-inside list-disc">
                                {row.original.series?.map((serie) => (
                                  <li key={serie.id}>{serie.name}</li>
                                ))}
                              </ul>
                            </li>
                          </ul>
                          <h3 className="text-lg font-bold">
                            Lesiones encontradas en el exámen:
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Organo(s) afectado(s)</TableHead>
                                <TableHead>Volúmen (cm3)</TableHead>
                                <TableHead>Diámetro Axial Mayor (mm)</TableHead>
                                <TableHead>Diámetro Mayor (mm)</TableHead>
                                <TableHead>Lesión objetivo</TableHead>
                                <TableHead>Tipo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>Lesión 1</TableCell>
                                <TableCell>Pulmón derecho</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>5</TableCell>
                                <TableCell>8</TableCell>
                                <TableCell>Objetivo</TableCell>
                                <TableCell>Tumor</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Lesión 2</TableCell>
                                <TableCell>Estómago</TableCell>
                                <TableCell>3</TableCell>
                                <TableCell>7</TableCell>
                                <TableCell>10</TableCell>
                                <TableCell>No objetivo</TableCell>
                                <TableCell>Nodo linfático maligno</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Lesión 3</TableCell>
                                <TableCell>Riñon</TableCell>
                                <TableCell>3</TableCell>
                                <TableCell>5</TableCell>
                                <TableCell>6</TableCell>
                                <TableCell>Objetivo</TableCell>
                                <TableCell>Tumor</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
