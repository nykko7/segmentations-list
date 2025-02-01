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
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { type Study } from "./columns";
import { env } from "@/env";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    React.useState<VisibilityState>({
      patient_code: false,
      study_id: false,
    });
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
        const newExpandedState = !prev[rowId];
        const rowData = data.find((row) => row.study_id.toString() === rowId);

        if (newExpandedState && rowData) {
          setSelectedStudies((prev) => ({
            ...prev,
            [rowData.patient_code]: rowData.study_id.toString(),
          }));
        } else if (rowData) {
          setSelectedStudies((prev) => {
            const newState = { ...prev };
            delete newState[rowData.patient_code];
            return newState;
          });
        }

        return {
          ...prev,
          [rowId]: newExpandedState,
        };
      });
    },
    [data],
  );

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

  const getRelatedStudies = (patientCode: string) => {
    return data.filter((study) => study.patient_code === patientCode);
  };

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
                          {(() => {
                            const relatedStudies = data
                              .filter(
                                (study) =>
                                  study.patient_code ===
                                  row.original.patient_code,
                              )
                              .sort(
                                (a, b) =>
                                  new Date(b.arrived_at).getTime() -
                                  new Date(a.arrived_at).getTime(),
                              );

                            const currentStudyId =
                              selectedStudies[row.original.patient_code] ??
                              row.original.study_id.toString();

                            if (!selectedStudies[row.original.patient_code]) {
                              setSelectedStudies((prev) => ({
                                ...prev,
                                [row.original.patient_code]: currentStudyId,
                              }));
                            }

                            return relatedStudies.length > 0 ? (
                              <Tabs
                                value={currentStudyId}
                                onValueChange={(value) => {
                                  setSelectedStudies((prev) => ({
                                    ...prev,
                                    [row.original.patient_code]: value,
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
                                          relatedStudies.findIndex(
                                            (s) =>
                                              s.study_id.toString() ===
                                              currentStudyId,
                                          );
                                        if (currentIndex > 0) {
                                          setSelectedStudies((prev) => ({
                                            ...prev,
                                            [row.original.patient_code]:
                                              relatedStudies[
                                                currentIndex - 1
                                              ]?.study_id.toString() ?? "",
                                          }));
                                        }
                                      }}
                                      disabled={
                                        currentStudyId ===
                                        relatedStudies[0]?.study_id.toString()
                                      }
                                    >
                                      <ChevronLeft className="h-5 w-5" />
                                    </Button>

                                    <Select
                                      value={currentStudyId}
                                      onValueChange={(value) => {
                                        setSelectedStudies((prev) => ({
                                          ...prev,
                                          [row.original.patient_code]: value,
                                        }));
                                      }}
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue>
                                          {new Date(
                                            relatedStudies.find(
                                              (s) =>
                                                s.study_id.toString() ===
                                                currentStudyId,
                                            )?.arrived_at ?? "",
                                          ).toLocaleDateString("es-CL", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                          })}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {relatedStudies.map((study) => (
                                          <SelectItem
                                            key={study.study_id}
                                            value={study.study_id.toString()}
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
                                          relatedStudies.findIndex(
                                            (s) =>
                                              s.study_id.toString() ===
                                              currentStudyId,
                                          );
                                        if (
                                          currentIndex <
                                          relatedStudies.length - 1
                                        ) {
                                          setSelectedStudies((prev) => ({
                                            ...prev,
                                            [row.original.patient_code]:
                                              relatedStudies[
                                                currentIndex + 1
                                              ]?.study_id.toString() ?? "",
                                          }));
                                        }
                                      }}
                                      disabled={
                                        currentStudyId ===
                                        relatedStudies[
                                          relatedStudies.length - 1
                                        ]?.study_id.toString()
                                      }
                                    >
                                      <ChevronRight className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>

                                {relatedStudies.map((study) => (
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
                                        <span className="font-bold">
                                          Series:
                                        </span>
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
                                    <div className="rounded-md border bg-muted/40">
                                      <Table>
                                        <TableHeader className="bg-muted/80">
                                          <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>
                                              Órgano(s) afectado(s)
                                            </TableHead>
                                            <TableHead>Volumen (cm3)</TableHead>
                                            <TableHead className="max-w-24">
                                              Diámetro Axial Mayor (mm)
                                            </TableHead>
                                            <TableHead className="max-w-24">
                                              Diámetro Mayor (mm)
                                            </TableHead>
                                            <TableHead>
                                              Lesión objetivo
                                            </TableHead>
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
                            ) : (
                              <p className="text-muted-foreground">
                                No hay estudios asociados para este paciente.
                              </p>
                            );
                          })()}
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
