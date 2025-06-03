"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Target,
  Circle,
  PlusCircle,
  CircleDashed,
  CrosshairIcon,
} from "lucide-react";
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
import { affectedOrgansLabels } from "@/lib/constants/affected-organs-labels";

interface DataTableProps<TData extends Study, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Study, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // Get the accession number from URL if it exists
  const searchParams = useSearchParams();
  const urlAccessionNumber = searchParams.get("AccessionNumber") || "";
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      patient_code: false,
      study_id: false,
    });
  // Initialize column filters with accession number from URL if present
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    urlAccessionNumber
      ? [
          {
            id: "study_uuid",
            value: urlAccessionNumber,
          },
        ]
      : [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // Effect to initialize expandedRows when data changes and URL has accessionNumber
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});

  // Auto-expand rows when filtered by accession number
  React.useEffect(() => {
    if (urlAccessionNumber && data.length > 0) {
      // Find matching rows and expand them
      const newExpandedRows: Record<string, boolean> = {};

      data.forEach((study, index) => {
        // If the study UUID or ID matches the accession number, expand the row
        if (
          study.study_uuid
            ?.toLowerCase()
            .includes(urlAccessionNumber.toLowerCase()) ||
          study.study_id
            ?.toLowerCase()
            .includes(urlAccessionNumber.toLowerCase())
        ) {
          newExpandedRows[index] = true;
        }
      });

      // Only update if we found matches
      if (Object.keys(newExpandedRows).length > 0) {
        setExpandedRows(newExpandedRows);
      }
    }
  }, [data, urlAccessionNumber]);
  const [selectedStudies, setSelectedStudies] = React.useState<
    Record<string, string>
  >({});

  const getRowKey = React.useCallback(
    (patientCode: string, studyId: string) => {
      return `${patientCode}-${studyId}`;
    },
    [],
  );

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
            [getRowKey(rowData.patient_code, rowData.study_id)]:
              rowData.study_id.toString(),
          }));
        } else if (rowData) {
          setSelectedStudies((prev) => {
            const newState = { ...prev };
            delete newState[getRowKey(rowData.patient_code, rowData.study_id)];
            return newState;
          });
        }

        return {
          ...prev,
          [rowId]: newExpandedState,
        };
      });
    },
    [data, getRowKey],
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
                            const relatedStudies = data.filter(
                              (study) =>
                                study.patient_code ===
                                row.original.patient_code,
                            );

                            const currentStudyId =
                              selectedStudies[
                                getRowKey(
                                  row.original.patient_code,
                                  row.original.study_id,
                                )
                              ] ?? row.original.study_id.toString();

                            const currentStudy = relatedStudies.find(
                              (study) => study.study_id === currentStudyId,
                            );

                            if (
                              !selectedStudies[
                                getRowKey(
                                  row.original.patient_code,
                                  row.original.study_id,
                                )
                              ]
                            ) {
                              setSelectedStudies((prev) => ({
                                ...prev,
                                [getRowKey(
                                  row.original.patient_code,
                                  row.original.study_id,
                                )]: currentStudyId,
                              }));
                            }

                            return relatedStudies.length > 0 ? (
                              <Tabs
                                value={currentStudyId}
                                onValueChange={(value) => {
                                  setSelectedStudies((prev) => ({
                                    ...prev,
                                    [getRowKey(
                                      row.original.patient_code,
                                      row.original.study_id,
                                    )]: value,
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
                                            [getRowKey(
                                              row.original.patient_code,
                                              row.original.study_id,
                                            )]:
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
                                          [getRowKey(
                                            row.original.patient_code,
                                            row.original.study_id,
                                          )]: value,
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
                                            className={cn({
                                              "bg-muted":
                                                study.study_id.toString() ===
                                                currentStudyId,
                                              "font-bold":
                                                study.study_id.toString() ===
                                                row.original.study_id.toString(),
                                            })}
                                          >
                                            <div className="flex items-center gap-2">
                                              {study.study_id.toString() ===
                                                row.original.study_id.toString() && (
                                                <span className="text-primary">
                                                  •
                                                </span>
                                              )}
                                              {new Date(
                                                study.arrived_at,
                                              ).toLocaleDateString("es-CL", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                              })}
                                            </div>
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
                                            [getRowKey(
                                              row.original.patient_code,
                                              row.original.study_id,
                                            )]:
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
                                            <li key={serie.series_instance_uid}>
                                              {serie.series_name
                                                ? `${serie.series_name} (${serie.body_region}) - ${serie.series_instance_uid}`
                                                : serie.series_instance_uid}
                                            </li>
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
                                          {(() => {
                                            const segments =
                                              currentStudy?.series?.[0]
                                                ?.segmentations?.[0]
                                                ?.segments ?? [];
                                            return segments
                                              .sort((a, b) => {
                                                // Sort by classification: Target first, then Non-Target, then New
                                                const classificationOrder = {
                                                  Target: 0,
                                                  "Non-Target": 1,
                                                  "New Lesion": 2,
                                                };

                                                const aOrder =
                                                  classificationOrder[
                                                    a.lession_classification as keyof typeof classificationOrder
                                                  ] ?? 3;
                                                const bOrder =
                                                  classificationOrder[
                                                    b.lession_classification as keyof typeof classificationOrder
                                                  ] ?? 3;

                                                return aOrder - bOrder;
                                              })
                                              .map((segment) => (
                                                <TableRow key={segment.id}>
                                                  <TableCell>
                                                    {segment.name}
                                                  </TableCell>
                                                  <TableCell>
                                                    {affectedOrgansLabels[
                                                      segment.affected_organs
                                                    ] ??
                                                      segment.affected_organs}
                                                  </TableCell>
                                                  <TableCell>
                                                    {(
                                                      segment.volume / 1000
                                                    ).toFixed(2)}
                                                  </TableCell>
                                                  <TableCell>
                                                    {segment.axial_diameter?.toFixed(
                                                      2,
                                                    ) ?? "N/A"}
                                                  </TableCell>
                                                  <TableCell>
                                                    {segment.sagittal_diameter?.toFixed(
                                                      2,
                                                    ) ?? "N/A"}
                                                  </TableCell>
                                                  <TableCell className="flex items-center gap-2">
                                                    {segment.lession_classification ===
                                                    "Target" ? (
                                                      <>
                                                        <CrosshairIcon className="h-4 w-4 text-primary" />
                                                        Objetivo
                                                      </>
                                                    ) : segment.lession_classification ===
                                                      "Non-Target" ? (
                                                      <>
                                                        <Circle className="h-4 w-4 text-muted-foreground" />
                                                        No objetivo
                                                      </>
                                                    ) : (
                                                      <>
                                                        <CircleDashed className="h-4 w-4 text-destructive" />
                                                        Nueva
                                                      </>
                                                    )}
                                                  </TableCell>
                                                  <TableCell>
                                                    {segment.lession_type}
                                                  </TableCell>
                                                </TableRow>
                                              ));
                                          })()}
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
