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
import { ChevronRight, ChevronsRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { type Patient, type Study } from "./columns";
import { env } from "@/env";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  nonTargetLesions?: {
    id: number;
    site: string;
    measurements: Record<string, number>; // studyId -> value
  }[];
  newLesions?: {
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
        const row = table.getRowModel().rows.find((r) => r.id === rowId);

        if (willExpand && row) {
          setSelectedStudies((prev) => ({
            ...prev,
            [rowId]: row.original.studies[0]?.id.toString() ?? "",
          }));

          if (!lesionMeasurements[rowId]) {
            const studies = row.original.studies;

            // Target lesions remain the same as they are required
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

            // Random number of non-target lesions (0 to 3)
            const nonTargetLesionSites = [
              { site: "Nódulo pulmonar derecho", id: 1 },
              { site: "Adenopatía cervical", id: 2 },
              { site: "Nódulo hepático", id: 3 },
            ];
            const numNonTargetLesions = Math.floor(Math.random() * 4); // 0 to 3
            const nonTargetLesions = nonTargetLesionSites
              .slice(0, numNonTargetLesions)
              .map((lesion) => ({
                ...lesion,
                measurements: studies.reduce<Record<number, number>>(
                  (acc, study) => ({
                    ...acc,
                    [study.id]: Math.floor(Math.random() * 100),
                  }),
                  {},
                ),
              }));

            // Random number of new lesions (0 to 2)
            const newLesionSites = [
              { site: "Nódulo hepático", id: 1 },
              { site: "Lesión ósea", id: 2 },
            ];
            const numNewLesions = Math.floor(Math.random() * 3); // 0 to 2
            const newLesions = newLesionSites
              .slice(0, numNewLesions)
              .map((lesion) => ({
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
              [rowId]: {
                targetLesions,
                nonTargetLesions:
                  nonTargetLesions.length > 0 ? nonTargetLesions : undefined,
                newLesions: newLesions.length > 0 ? newLesions : undefined,
                sumByStudy,
              },
            }));
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
                            value={selectedStudies[row.id]}
                            onValueChange={(value) => {
                              setSelectedStudies((prev) => ({
                                ...prev,
                                [row.id]: value,
                              }));
                            }}
                            className="w-full"
                          >
                            <div className="mb-4 flex items-center gap-4">
                              <span className="font-bold">Estudio:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  className="px-2"
                                  onClick={() => {
                                    const currentIndex =
                                      row.original.studies.findIndex(
                                        (s) =>
                                          s.id.toString() ===
                                          selectedStudies[row.id],
                                      );
                                    if (currentIndex > 0) {
                                      setSelectedStudies((prev) => ({
                                        ...prev,
                                        [row.id]:
                                          row.original.studies[
                                            currentIndex - 1
                                          ]?.id.toString() ?? "",
                                      }));
                                    }
                                  }}
                                  disabled={
                                    selectedStudies[row.id] ===
                                    row.original.studies[0]?.id.toString()
                                  }
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <Select
                                  value={selectedStudies[row.id]}
                                  onValueChange={(value) => {
                                    setSelectedStudies((prev) => ({
                                      ...prev,
                                      [row.id]: value,
                                    }));
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue>
                                      {new Date(
                                        row.original.studies.find(
                                          (s) =>
                                            s.id.toString() ===
                                            selectedStudies[row.id],
                                        )?.arrived_at ?? "",
                                      ).toLocaleDateString("es-CL", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                      })}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {row.original.studies.map((study) => (
                                      <SelectItem
                                        key={study.id}
                                        value={study.id.toString()}
                                      >
                                        {new Date(
                                          study.arrived_at,
                                        ).toLocaleDateString("es-CL", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                        })}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Button
                                  variant="outline"
                                  className="px-2"
                                  onClick={() => {
                                    const currentIndex =
                                      row.original.studies.findIndex(
                                        (s) =>
                                          s.id.toString() ===
                                          selectedStudies[row.id],
                                      );
                                    if (
                                      currentIndex <
                                      row.original.studies.length - 1
                                    ) {
                                      setSelectedStudies((prev) => ({
                                        ...prev,
                                        [row.id]:
                                          row.original.studies[
                                            currentIndex + 1
                                          ]?.id.toString() ?? "",
                                      }));
                                    }
                                  }}
                                  disabled={
                                    selectedStudies[row.id] ===
                                    row.original.studies[
                                      row.original.studies.length - 1
                                    ]?.id.toString()
                                  }
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>

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
                                {(lesionMeasurements[row.id]?.targetLesions
                                  ?.length ?? 0) > 0 ? (
                                  <div className="rounded-md border bg-muted/40">
                                    <Table>
                                      <TableHeader className="bg-muted/80">
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
                                                "bg-primary/20":
                                                  selectedStudies[row.id] ===
                                                  s.id.toString(),
                                              })}
                                            >
                                              {/* Diámetro Axial Mayor (mm)
                                              <br /> */}
                                              Estudio {s.id} / Fecha:{" "}
                                              {new Date(
                                                s.arrived_at,
                                              ).toLocaleDateString("es-CL", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                              })}
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
                                                  "bg-primary/20":
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
                                                "bg-primary/20":
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
                                ) : (
                                  <p className="text-muted-foreground">
                                    No hay lesiones target
                                  </p>
                                )}

                                <h4 className="mt-4 text-lg font-bold">
                                  Lesiones no Target
                                </h4>
                                {(lesionMeasurements[row.id]?.nonTargetLesions
                                  ?.length ?? 0) > 0 ? (
                                  <div className="rounded-md border bg-muted/40">
                                    <Table>
                                      <TableHeader className="bg-muted/80">
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
                                                "bg-primary/20":
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
                                        ]?.nonTargetLesions?.map((lesion) => (
                                          <TableRow key={lesion.id}>
                                            <TableCell>{lesion.id}</TableCell>
                                            <TableCell>{lesion.site}</TableCell>
                                            {row.original.studies.map((s) => (
                                              <TableCell
                                                key={s.id}
                                                className={cn({
                                                  "bg-primary/20":
                                                    selectedStudies[row.id] ===
                                                    s.id.toString(),
                                                })}
                                              >
                                                {lesion.measurements[s.id]}
                                              </TableCell>
                                            ))}
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">
                                    No hay lesiones no target
                                  </p>
                                )}

                                <h4 className="mt-4 text-lg font-bold">
                                  Lesiones nuevas
                                </h4>
                                {(lesionMeasurements[row.id]?.newLesions
                                  ?.length ?? 0) > 0 ? (
                                  <div className="rounded-md border bg-muted/40">
                                    <Table>
                                      <TableHeader className="bg-muted/80">
                                        <TableRow>
                                          <TableHead className="min-w-[200px]">
                                            Sitio / Subsitio Anatómico
                                          </TableHead>
                                          {row.original.studies.map((s) => (
                                            <TableHead
                                              key={s.id}
                                              className={cn({
                                                "bg-primary/20":
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
                                        ]?.newLesions?.map((lesion) => (
                                          <TableRow key={lesion.id}>
                                            <TableCell>{lesion.site}</TableCell>
                                            {row.original.studies.map((s) => (
                                              <TableCell
                                                key={s.id}
                                                className={cn({
                                                  "bg-primary/20":
                                                    selectedStudies[row.id] ===
                                                    s.id.toString(),
                                                })}
                                              >
                                                {lesion.measurements[s.id]}
                                              </TableCell>
                                            ))}
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">
                                    No hay lesiones nuevas
                                  </p>
                                )}
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
