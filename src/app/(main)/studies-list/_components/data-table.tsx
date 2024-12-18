"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type FilterFn,
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
import { type Study } from "./columns";
import { env } from "@/env";

interface DataTableProps<TData extends Study, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function generateRandomLesions(
  count: number = Math.floor(Math.random() * 4) + 1,
) {
  const organs = [
    "Pulmón derecho",
    "Pulmón izquierdo",
    "Hígado",
    "Riñón",
    "Estómago",
    "Páncreas",
  ];
  const types = ["Tumor", "Nodo linfático maligno", "Metástasis"];
  const targetTypes = ["Objetivo", "No objetivo"];

  return Array.from({ length: count }, (_, i) => ({
    name: `Lesión ${i + 1}`,
    organ: organs[Math.floor(Math.random() * organs.length)],
    volume: (Math.random() * 10).toFixed(1),
    axialDiameter: Math.floor(Math.random() * 20) + 5,
    majorDiameter: Math.floor(Math.random() * 25) + 10,
    target: targetTypes[Math.floor(Math.random() * targetTypes.length)],
    type: types[Math.floor(Math.random() * types.length)],
  }));
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

  const handleRowClick = React.useCallback(
    (event: React.MouseEvent, rowId: string) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLButtonElement ||
        (event.target as HTMLElement).closest("input") ||
        (event.target as HTMLElement).closest("button")
      ) {
        return;
      }
      toggleRowExpanded(rowId);
    },
    [toggleRowExpanded],
  );

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
                    onClick={(e) => handleRowClick(e, row.id)}
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
                            defaultValue={row.original.study_id.toString()}
                            className="w-full"
                          >
                            <TabsList className="mb-2 flex justify-start space-x-2 px-2">
                              <span className="font-bold">Estudios:</span>
                              {data
                                .filter(
                                  (study) =>
                                    study.patient_code ===
                                    row.original.patient_code,
                                )
                                .map((study, index) => (
                                  <TabsTrigger
                                    key={study.study_id}
                                    value={study.study_id.toString()}
                                    className={cn({
                                      "font-bold": index === 0,
                                      "border border-primary":
                                        study.study_id ===
                                        row.original.study_id,
                                    })}
                                  >
                                    {new Date(
                                      study.arrived_at,
                                    ).toLocaleDateString()}
                                  </TabsTrigger>
                                ))}
                            </TabsList>
                            {data
                              .filter(
                                (study) =>
                                  study.patient_code ===
                                  row.original.patient_code,
                              )
                              .map((study) => (
                                <TabsContent
                                  key={study.study_id}
                                  value={study.study_id.toString()}
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
                                      {study.study_uuid}
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
                                      href={`${env.NEXT_PUBLIC_OHIF_VIEWER_URL}/${env.NEXT_PUBLIC_OHIF_VIEWER_MODE}?StudyInstanceUIDs=${study.study_uuid}`}
                                      target="_blank"
                                    >
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                      >
                                        <Image
                                          src={
                                            "/tchaii/icons/ohif-icon-32x32.png"
                                          }
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
                                    Lesiones encontradas en el estudio:
                                  </h3>
                                  <div className="rounded-md border">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nombre</TableHead>
                                          <TableHead>
                                            Organo(s) afectado(s)
                                          </TableHead>
                                          <TableHead>Volúmen (cm3)</TableHead>
                                          <TableHead>
                                            Diámetro Axial Mayor (mm)
                                          </TableHead>
                                          <TableHead>
                                            Diámetro Mayor (mm)
                                          </TableHead>
                                          <TableHead>Lesión objetivo</TableHead>
                                          <TableHead>Tipo</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {generateRandomLesions().map(
                                          (lesion, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                {lesion.name}
                                              </TableCell>
                                              <TableCell>
                                                {lesion.organ}
                                              </TableCell>
                                              <TableCell>
                                                {lesion.volume}
                                              </TableCell>
                                              <TableCell>
                                                {lesion.axialDiameter}
                                              </TableCell>
                                              <TableCell>
                                                {lesion.majorDiameter}
                                              </TableCell>
                                              <TableCell>
                                                {lesion.target}
                                              </TableCell>
                                              <TableCell>
                                                {lesion.type}
                                              </TableCell>
                                            </TableRow>
                                          ),
                                        )}
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
