"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Patient, Study } from "./columns";

interface DataTableProps<TData extends Patient, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type Lesion = {
  number: number;
  anatomicalSite: string;
  measurements: {
    date: string;
    diameter: number;
  }[];
};

function generateControlColumns(study: Study) {
  const date = new Date(study.arrived_at);
  return {
    date: date.toLocaleDateString(),
    label: `Control ${study.id}`,
  };
}

export function DataTable<TData extends Patient, TValue>({
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
                            Estudios asociados al paciente:
                          </h3>
                          <Tabs
                            defaultValue={row.original.studies[0]?.id.toString()}
                            className="w-full"
                          >
                            <TabsList className="mb-2 flex justify-start space-x-2 px-2">
                              <span className="font-bold">Estudios:</span>
                              {row.original.studies.map((study, index) => (
                                <TabsTrigger
                                  key={study.id}
                                  value={study.id.toString()}
                                  className={cn({
                                    "font-bold": index === 0,
                                  })}
                                >
                                  {new Date(
                                    study.arrived_at,
                                  ).toLocaleDateString()}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            {row.original.studies.map((study) => (
                              <TabsContent
                                key={study.id}
                                value={study.id.toString()}
                                className="mt-0 flex flex-col gap-y-2"
                              >
                                <h3 className="text-lg font-bold">
                                  Información del estudio:
                                </h3>
                                <ul className="list-inside list-disc">
                                  <li>
                                    <span className="font-bold">
                                      Study UUID:
                                    </span>{" "}
                                    {study.uuid}
                                  </li>
                                  <li>
                                    <span className="font-bold">Series:</span>
                                    <ul className="ml-3 list-inside list-disc">
                                      {study.series?.map((serie) => (
                                        <li key={serie.id}>{serie.name}</li>
                                      ))}
                                    </ul>
                                  </li>
                                </ul>

                                <h3 className="text-lg font-bold">
                                  Revisar estudio:
                                </h3>
                                <div className="flex gap-3">
                                  <Link
                                    href={`https://segmai.scian.cl/pacs/ohif/viewer?StudyInstanceUIDs=${study.uuid}`}
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

                                <h3 className="mt-4 text-lg font-bold">
                                  Lesiones Target
                                </h3>
                                {/* Target Lesions Table */}
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-12">
                                          N°
                                        </TableHead>
                                        <TableHead className="min-w-[200px]">
                                          Sitio / Subsitio Anatómico
                                        </TableHead>
                                        <TableHead>
                                          Control {study.id} / Fecha:{" "}
                                          {new Date(
                                            study.arrived_at,
                                          ).toLocaleDateString()}
                                        </TableHead>
                                        {row.original.studies
                                          .filter((s) => s.id > study.id)
                                          .map((s) => (
                                            <TableHead key={s.id}>
                                              Control {s.id} / Fecha:{" "}
                                              {new Date(
                                                s.arrived_at,
                                              ).toLocaleDateString()}
                                            </TableHead>
                                          ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>1</TableCell>
                                        <TableCell>pulmón LII</TableCell>
                                        <TableCell>73</TableCell>
                                        <TableCell>65</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>2</TableCell>
                                        <TableCell>
                                          mediastino para traqueal
                                        </TableCell>
                                        <TableCell>14</TableCell>
                                        <TableCell>9</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>3</TableCell>
                                        <TableCell>
                                          mediastino anterior a VCS
                                        </TableCell>
                                        <TableCell>11</TableCell>
                                        <TableCell>9</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                      </TableRow>
                                      <TableRow className="font-medium">
                                        <TableCell colSpan={2}>
                                          Sumatoria de Diámetros
                                        </TableCell>
                                        <TableCell>98</TableCell>
                                        <TableCell>83</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Non-Target Lesions Table */}
                                <h4 className="mt-4 text-lg font-bold">
                                  Lesiones no Target
                                </h4>
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-12">
                                          N°
                                        </TableHead>
                                        <TableHead className="min-w-[200px]">
                                          Sitio / Subsitio Anatómico
                                        </TableHead>
                                        {row.original.studies.map((s) => (
                                          <TableHead key={s.id}>
                                            Control {s.id} / Fecha:{" "}
                                            {new Date(
                                              s.arrived_at,
                                            ).toLocaleDateString()}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {/* Empty rows for non-target lesions */}
                                      {[1, 2, 3, 4, 5].map((n) => (
                                        <TableRow key={n}>
                                          <TableCell>{n}</TableCell>
                                          <TableCell></TableCell>
                                          {row.original.studies.map((s) => (
                                            <TableCell key={s.id}></TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* New Lesions Table */}
                                <h4 className="mt-4 text-lg font-bold">
                                  Lesiones nuevas
                                </h4>
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="min-w-[200px]">
                                          Sitio / Subsitio Anatómico
                                        </TableHead>
                                        {row.original.studies.map((s) => (
                                          <TableHead key={s.id}>
                                            Control {s.id} / Fecha:{" "}
                                            {new Date(
                                              s.arrived_at,
                                            ).toLocaleDateString()}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {/* Empty rows for new lesions */}
                                      {[1, 2, 3, 4].map((n) => (
                                        <TableRow key={n}>
                                          <TableCell></TableCell>
                                          {row.original.studies.map((s) => (
                                            <TableCell key={s.id}></TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
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
