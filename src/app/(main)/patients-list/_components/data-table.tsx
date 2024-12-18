"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
import { type Patient, type Study } from "./columns";
import { env } from "@/env";

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

type LesionMeasurements = {
  targetLesions: {
    id: number;
    site: string;
    measurements: Record<string, number>; // studyId -> value
  }[];
  sumByStudy: Record<string, number>; // studyId -> sum
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
  const [selectedStudies, setSelectedStudies] = React.useState<
    Record<string, string>
  >({});
  const [lesionMeasurements, setLesionMeasurements] = React.useState<
    Record<string, LesionMeasurements>
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

  const toggleRowExpanded = React.useCallback(
    (rowId: string) => {
      setExpandedRows((prev) => {
        const willExpand = !prev[rowId];

        if (willExpand) {
          const row = table.getRowModel().rows.find((r) => r.id === rowId);
          if (row) {
            const firstStudy = row.original.studies[0];
            if (firstStudy) {
              setSelectedStudies((prev) => ({
                ...prev,
                [rowId]: firstStudy.id.toString(),
              }));
            }

            if (!lesionMeasurements[rowId]) {
              const studies = row.original.studies;
              const targetLesions = [
                { site: "pulmón LII", id: 1 },
                { site: "mediastino para traqueal", id: 2 },
                { site: "mediastino anterior a VCS", id: 3 },
              ].map((lesion) => ({
                ...lesion,
                measurements: studies.reduce<Record<number, number>>(
                  (acc, study) => ({
                    ...acc,
                    [study.id]: Math.floor(Math.random() * 100),
                  }),
                  {},
                ),
              }));

              const sumByStudy = studies.reduce<Record<number, number>>(
                (acc, study) => ({
                  ...acc,
                  [study.id]: targetLesions.reduce(
                    (sum, lesion) => sum + (lesion.measurements[study.id] ?? 0),
                    0,
                  ),
                }),
                {},
              );

              setLesionMeasurements((prev) => ({
                ...prev,
                [rowId]: { targetLesions, sumByStudy },
              }));
            }
          }
        } else {
          setSelectedStudies((prev) => {
            const next = { ...prev };
            delete next[rowId];
            return next;
          });
        }

        return {
          ...prev,
          [rowId]: willExpand,
        };
      });
    },
    [table, lesionMeasurements],
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
                            onValueChange={(value) =>
                              setSelectedStudies((prev) => ({
                                ...prev,
                                [row.id]: value,
                              }))
                            }
                            value={
                              selectedStudies[row.id] ??
                              row.original.studies[0]?.id.toString()
                            }
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
                                    href={`${env.NEXT_PUBLIC_OHIF_VIEWER_URL}/${env.NEXT_PUBLIC_OHIF_VIEWER_MODE}?StudyInstanceUIDs=${study.uuid}`}
                                    target="_blank"
                                  >
                                    <Button variant="outline" className="gap-2">
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

                                <h3 className="mt-4 text-lg font-bold">
                                  Lesiones Target
                                </h3>
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
                                          <TableHead
                                            key={s.id}
                                            className={cn({
                                              "bg-muted":
                                                selectedStudies[row.id] ===
                                                s.id.toString(),
                                            })}
                                          >
                                            Estudio {s.id} / Fecha:{" "}
                                            {new Date(
                                              s.arrived_at,
                                            ).toLocaleDateString()}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {lesionMeasurements[
                                        row.id
                                      ]?.targetLesions.map((lesion) => (
                                        <TableRow key={lesion.id}>
                                          <TableCell>{lesion.id}</TableCell>
                                          <TableCell>{lesion.site}</TableCell>
                                          {row.original.studies.map((s) => (
                                            <TableCell
                                              key={s.id}
                                              className={cn({
                                                "bg-muted":
                                                  selectedStudies[row.id] ===
                                                  s.id.toString(),
                                              })}
                                            >
                                              {lesion.measurements[s.id]}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                      <TableRow className="font-medium">
                                        <TableCell colSpan={2}>
                                          Sumatoria de Diámetros
                                        </TableCell>
                                        {row.original.studies.map((s) => (
                                          <TableCell
                                            key={s.id}
                                            className={cn({
                                              "bg-muted":
                                                selectedStudies[row.id] ===
                                                s.id.toString(),
                                            })}
                                          >
                                            {
                                              lesionMeasurements[row.id]
                                                ?.sumByStudy[s.id]
                                            }
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>

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
                                          <TableHead
                                            key={s.id}
                                            className={cn({
                                              "bg-muted":
                                                selectedStudies[row.id] ===
                                                s.id.toString(),
                                            })}
                                          >
                                            Estudio {s.id} / Fecha:{" "}
                                            {new Date(
                                              s.arrived_at,
                                            ).toLocaleDateString()}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {[1, 2, 3, 4, 5].map((n) => (
                                        <TableRow key={n}>
                                          <TableCell>{n}</TableCell>
                                          <TableCell></TableCell>
                                          {row.original.studies.map((s) => (
                                            <TableCell
                                              key={s.id}
                                              className={cn({
                                                "bg-muted":
                                                  selectedStudies[row.id] ===
                                                  s.id.toString(),
                                              })}
                                            ></TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

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
                                          <TableHead
                                            key={s.id}
                                            className={cn({
                                              "bg-muted":
                                                selectedStudies[row.id] ===
                                                s.id.toString(),
                                            })}
                                          >
                                            Estudio {s.id} / Fecha:{" "}
                                            {new Date(
                                              s.arrived_at,
                                            ).toLocaleDateString()}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {[1, 2, 3, 4].map((n) => (
                                        <TableRow key={n}>
                                          <TableCell></TableCell>
                                          {row.original.studies.map((s) => (
                                            <TableCell
                                              key={s.id}
                                              className={cn({
                                                "bg-muted":
                                                  selectedStudies[row.id] ===
                                                  s.id.toString(),
                                              })}
                                            ></TableCell>
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
