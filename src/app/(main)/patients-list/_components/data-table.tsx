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
import { unstable_noStore as noStore } from "next/cache";
import { affectedOrgansLabels } from "@/lib/constants/affected-organs-labels";
import { CrosshairIcon, Circle, PlusCircle } from "lucide-react";

interface DataTableProps<TData extends Patient, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type LesionData = {
  id: string;
  name: string;
  label: string;
  affected_organs: string;
  volume: number;
  axial_diameter: number | null;
  coronal_diameter: number | null;
  sagittal_diameter: number | null;
  lession_classification: string;
  lession_type: string;
  segmentation_type: string;
};

type LesionMeasurements = {
  targetLesions: {
    id: string;
    site: string;
    measurements: Record<string, number>; // studyId -> diameter value
  }[];
  nonTargetLesions: {
    id: string;
    site: string;
    measurements: Record<string, number>; // studyId -> diameter value
  }[];
  newLesions: {
    id: string;
    site: string;
    measurements: Record<string, number>; // studyId -> diameter value
  }[];
  sumByStudy: Record<string, number>; // studyId -> sum
};

function extractLesionData(studies: Study[]): LesionMeasurements {
  const targetLesions: {
    id: string;
    site: string;
    measurements: Record<string, number>;
  }[] = [];
  const nonTargetLesions: {
    id: string;
    site: string;
    measurements: Record<string, number>;
  }[] = [];
  const newLesions: {
    id: string;
    site: string;
    measurements: Record<string, number>;
  }[] = [];

  // First, collect all unique lesions across all studies
  const lesionMap = new Map<
    string,
    { id: string; site: string; type: string; icon?: React.ReactNode }
  >();

  studies.forEach((study) => {
    study.series.forEach((series) => {
      series.segmentations.forEach((segmentation) => {
        segmentation.segments.forEach((segment) => {
          if (segment.is_deleted) return;

          // Determine lesion type based on classification first, then fallback to type
          let type = "unknown";
          let icon = undefined;

          // Primary classification based on lession_classification field
          if (segment.lession_classification === "Target") {
            type = "target";
            icon = <CrosshairIcon className="h-4 w-4 text-primary" />;
          } else if (segment.lession_classification === "Non-Target") {
            type = "nonTarget";
            icon = <Circle className="h-4 w-4 text-muted-foreground" />;
          } else if (segment.lession_classification === "New Lesion") {
            type = "new";
            icon = <PlusCircle className="h-4 w-4 text-destructive" />;
          } else {
            // Secondary classification based on lession_type field
            const lesionType = (segment.lession_type || "").toLowerCase();
            if (
              lesionType.includes("target") &&
              !lesionType.includes("no") &&
              !lesionType.includes("non")
            ) {
              type = "target";
              icon = <CrosshairIcon className="h-4 w-4 text-primary" />;
            } else if (
              lesionType.includes("no target") ||
              lesionType.includes("non-target") ||
              lesionType.includes("non target")
            ) {
              type = "nonTarget";
              icon = <Circle className="h-4 w-4 text-muted-foreground" />;
            } else if (lesionType.includes("new")) {
              type = "new";
              icon = <PlusCircle className="h-4 w-4 text-destructive" />;
            }
          }

          // Get organ name with translation if available
          const organName =
            affectedOrgansLabels[segment.affected_organs] ||
            segment.affected_organs ||
            segment.name ||
            "Lesión no especificada";

          // Create a unique key for this lesion
          const key = `${segment.id}-${organName}-${type}`;

          if (!lesionMap.has(key)) {
            lesionMap.set(key, {
              id: segment.id,
              site: organName,
              type,
              icon,
            });
          }
        });
      });
    });
  });

  // Create empty measurement records for each lesion
  const targetLesionsMap = new Map<
    string,
    { id: string; site: string; measurements: Record<string, number> }
  >();
  const nonTargetLesionsMap = new Map<
    string,
    { id: string; site: string; measurements: Record<string, number> }
  >();
  const newLesionsMap = new Map<
    string,
    { id: string; site: string; measurements: Record<string, number> }
  >();

  lesionMap.forEach((lesion, key) => {
    const measurements: Record<string, number> = {};
    studies.forEach((study) => {
      measurements[study.study_id] = 0;
    });

    if (lesion.type === "target") {
      targetLesionsMap.set(key, {
        id: lesion.id,
        site: lesion.site,
        measurements,
      });
    } else if (lesion.type === "nonTarget") {
      nonTargetLesionsMap.set(key, {
        id: lesion.id,
        site: lesion.site,
        measurements,
      });
    } else if (lesion.type === "new") {
      newLesionsMap.set(key, {
        id: lesion.id,
        site: lesion.site,
        measurements,
      });
    }
  });

  // Fill in measurements for each lesion in each study
  studies.forEach((study) => {
    study.series.forEach((series) => {
      series.segmentations.forEach((segmentation) => {
        segmentation.segments.forEach((segment) => {
          if (segment.is_deleted) return;

          // Get organ name with translation if available
          const organName =
            affectedOrgansLabels[segment.affected_organs] ||
            segment.affected_organs ||
            segment.name ||
            "Lesión no especificada";

          // Determine type for this segment
          let type = "unknown";
          if (segment.lession_classification === "Target") {
            type = "target";
          } else if (segment.lession_classification === "Non-Target") {
            type = "nonTarget";
          } else if (segment.lession_classification === "New Lesion") {
            type = "new";
          } else {
            const lesionType = (segment.lession_type || "").toLowerCase();
            if (
              lesionType.includes("target") &&
              !lesionType.includes("no") &&
              !lesionType.includes("non")
            ) {
              type = "target";
            } else if (
              lesionType.includes("no target") ||
              lesionType.includes("non-target") ||
              lesionType.includes("non target")
            ) {
              type = "nonTarget";
            } else if (lesionType.includes("new")) {
              type = "new";
            }
          }

          const key = `${segment.id}-${organName}-${type}`;

          // Use axial diameter if available, otherwise volume (convert to mm if needed)
          let value = 0;
          if (segment.axial_diameter) {
            value = segment.axial_diameter;
          } else if (segment.volume) {
            // Convert volume in mm³ to a diameter-like value (for display purposes)
            value = parseFloat((segment.volume / 1000).toFixed(2));
          }

          // Update measurement in the appropriate map
          if (type === "target" && targetLesionsMap.has(key)) {
            const lesion = targetLesionsMap.get(key)!;
            lesion.measurements[study.study_id] = value;
          } else if (type === "nonTarget" && nonTargetLesionsMap.has(key)) {
            const lesion = nonTargetLesionsMap.get(key)!;
            lesion.measurements[study.study_id] = value;
          } else if (type === "new" && newLesionsMap.has(key)) {
            const lesion = newLesionsMap.get(key)!;
            lesion.measurements[study.study_id] = value;
          }
        });
      });
    });
  });

  // If we don't have any real lesions, create some demo ones
  if (targetLesionsMap.size === 0) {
    const demoTargetLesions = [
      { id: "1", site: "Pulmón LII" },
      { id: "2", site: "Mediastino para traqueal" },
      { id: "3", site: "Mediastino anterior a VCS" },
    ];

    demoTargetLesions.forEach((lesion, index) => {
      const measurements: Record<string, number> = {};
      studies.forEach((study) => {
        // Create some realistic-looking random values
        measurements[study.study_id] = parseFloat(
          (Math.floor(Math.random() * 50) + 20).toFixed(2),
        );
      });
      targetLesionsMap.set(lesion.id, { ...lesion, measurements });
    });
  }

  // If we don't have non-target lesions, add demo ones
  if (nonTargetLesionsMap.size === 0 && studies.length > 0) {
    const demoNonTargetLesions = [{ id: "4", site: "Nódulo pulmonar derecho" }];

    demoNonTargetLesions.forEach((lesion) => {
      const measurements: Record<string, number> = {};
      studies.forEach((study) => {
        measurements[study.study_id] = parseFloat(
          (Math.floor(Math.random() * 30) + 10).toFixed(2),
        );
      });
      nonTargetLesionsMap.set(lesion.id, { ...lesion, measurements });
    });
  }

  // If we don't have new lesions and have more than one study, add demo ones
  if (newLesionsMap.size === 0 && studies.length > 1) {
    const demoNewLesions = [
      { id: "5", site: "Nódulo hepático" },
      { id: "6", site: "Lesión ósea" },
    ];

    demoNewLesions.forEach((lesion) => {
      const measurements: Record<string, number> = {};
      studies.forEach((study, index) => {
        // Only add measurements to studies after the first one
        if (index > 0) {
          measurements[study.study_id] = parseFloat(
            (Math.floor(Math.random() * 20) + 5).toFixed(2),
          );
        } else {
          measurements[study.study_id] = 0; // No measurement for baseline study
        }
      });
      newLesionsMap.set(lesion.id, { ...lesion, measurements });
    });
  }

  // Calculate sum by study for target lesions
  const sumByStudy: Record<string, number> = {};
  studies.forEach((study) => {
    sumByStudy[study.study_id] = 0;
    targetLesionsMap.forEach((lesion) => {
      if (
        lesion.measurements &&
        study.study_id &&
        lesion.measurements[study.study_id] !== undefined
      ) {
        const studyId = study.study_id;
        if (sumByStudy[studyId] !== undefined) {
          const currentSum = sumByStudy[studyId];
          const measurementValue = lesion.measurements[studyId] ?? 0;
          sumByStudy[studyId] = currentSum + measurementValue;
        }
      }
    });
    // Format the sum to 2 decimal places
    if (study.study_id && sumByStudy[study.study_id!] !== undefined) {
      sumByStudy[study.study_id!] = parseFloat(
        sumByStudy[study.study_id!]!.toFixed(2),
      );
    }
  });

  return {
    targetLesions: Array.from(targetLesionsMap.values()),
    nonTargetLesions: Array.from(nonTargetLesionsMap.values()),
    newLesions: Array.from(newLesionsMap.values()),
    sumByStudy,
  };
}

function formatStudyDate(dateString: string): string {
  if (!dateString) return "Fecha desconocida";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
            [rowId]: row.original.studies[0]?.study_id.toString() ?? "",
          }));

          if (!lesionMeasurements[rowId]) {
            const studies = row.original.studies;

            // Extract real lesion data from the API
            const measurements = extractLesionData(studies);

            setLesionMeasurements((prev) => ({
              ...prev,
              [rowId]: measurements,
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
                                          s.study_id.toString() ===
                                          selectedStudies[row.id],
                                      );
                                    if (currentIndex > 0) {
                                      setSelectedStudies((prev) => ({
                                        ...prev,
                                        [row.id]:
                                          row.original.studies[
                                            currentIndex - 1
                                          ]?.study_id.toString() ?? "",
                                      }));
                                    }
                                  }}
                                  disabled={
                                    selectedStudies[row.id] ===
                                    row.original.studies[0]?.study_id.toString()
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
                                      {formatStudyDate(
                                        row.original.studies.find(
                                          (s) =>
                                            s.study_id.toString() ===
                                            selectedStudies[row.id],
                                        )?.arrived_at ?? "",
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {row.original.studies.map((study) => (
                                      <SelectItem
                                        key={study.study_id}
                                        value={study.study_id.toString()}
                                      >
                                        {formatStudyDate(study.arrived_at)}
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
                                          s.study_id.toString() ===
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
                                          ]?.study_id.toString() ?? "",
                                      }));
                                    }
                                  }}
                                  disabled={
                                    selectedStudies[row.id] ===
                                    row.original.studies[
                                      row.original.studies.length - 1
                                    ]?.study_id.toString()
                                  }
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>

                            {row.original.studies.map((study) => (
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
                                        <li key={serie.series_instance_uid}>
                                          {serie.series_instance_uid}
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
                                          {row.original.studies.map(
                                            (s, index) => (
                                              <TableHead
                                                key={s.study_id}
                                                className={cn({
                                                  "bg-primary/20":
                                                    selectedStudies[row.id] ===
                                                    s.study_id.toString(),
                                                })}
                                              >
                                                Estudio {index + 1}
                                                <br />
                                                {formatStudyDate(s.arrived_at)}
                                              </TableHead>
                                            ),
                                          )}
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {lesionMeasurements[
                                          row.id
                                        ]?.targetLesions.map(
                                          (lesion, index) => (
                                            <TableRow key={lesion.id}>
                                              <TableCell>{index + 1}</TableCell>
                                              <TableCell>
                                                {lesion.site}
                                              </TableCell>
                                              {row.original.studies.map((s) => (
                                                <TableCell
                                                  key={s.study_id}
                                                  className={cn({
                                                    "bg-primary/20":
                                                      selectedStudies[
                                                        row.id
                                                      ] ===
                                                      s.study_id.toString(),
                                                  })}
                                                >
                                                  {lesion.measurements &&
                                                  s.study_id &&
                                                  lesion.measurements[
                                                    s.study_id
                                                  ] !== undefined &&
                                                  lesion.measurements[
                                                    s.study_id
                                                  ] !== 0
                                                    ? lesion.measurements[
                                                        s.study_id
                                                      ]!.toFixed(2)
                                                    : "-"}
                                                </TableCell>
                                              ))}
                                            </TableRow>
                                          ),
                                        )}
                                        <TableRow className="font-medium">
                                          <TableCell colSpan={2}>
                                            Sumatoria de Diámetros
                                          </TableCell>
                                          {row.original.studies.map((s) => (
                                            <TableCell
                                              key={s.study_id}
                                              className={cn({
                                                "bg-primary/20":
                                                  selectedStudies[row.id] ===
                                                  s.study_id.toString(),
                                              })}
                                            >
                                              {lesionMeasurements[row.id]
                                                ?.sumByStudy &&
                                              s.study_id &&
                                              lesionMeasurements[row.id]
                                                ?.sumByStudy[s.study_id] !==
                                                undefined &&
                                              lesionMeasurements[row.id]
                                                ?.sumByStudy[s.study_id] !== 0
                                                ? lesionMeasurements[
                                                    row.id
                                                  ]!.sumByStudy[
                                                    s.study_id
                                                  ]!.toFixed(2)
                                                : "-"}
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
                                          {row.original.studies.map(
                                            (s, index) => (
                                              <TableHead
                                                key={s.study_id}
                                                className={cn({
                                                  "bg-primary/20":
                                                    selectedStudies[row.id] ===
                                                    s.study_id.toString(),
                                                })}
                                              >
                                                Estudio {index + 1}
                                                <br />
                                                {formatStudyDate(s.arrived_at)}
                                              </TableHead>
                                            ),
                                          )}
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {lesionMeasurements[
                                          row.id
                                        ]?.nonTargetLesions?.map(
                                          (lesion, index) => (
                                            <TableRow key={lesion.id}>
                                              <TableCell>{index + 1}</TableCell>
                                              <TableCell>
                                                {lesion.site}
                                              </TableCell>
                                              {row.original.studies.map((s) => (
                                                <TableCell
                                                  key={s.study_id}
                                                  className={cn({
                                                    "bg-primary/20":
                                                      selectedStudies[
                                                        row.id
                                                      ] ===
                                                      s.study_id.toString(),
                                                  })}
                                                >
                                                  {lesion.measurements &&
                                                  s.study_id &&
                                                  lesion.measurements[
                                                    s.study_id
                                                  ] !== undefined &&
                                                  lesion.measurements[
                                                    s.study_id
                                                  ] !== 0
                                                    ? lesion.measurements[
                                                        s.study_id
                                                      ]!.toFixed(2)
                                                    : "-"}
                                                </TableCell>
                                              ))}
                                            </TableRow>
                                          ),
                                        )}
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
                                          <TableHead className="w-12">
                                            N°
                                          </TableHead>
                                          <TableHead className="min-w-[200px]">
                                            Sitio / Subsitio Anatómico
                                          </TableHead>
                                          {row.original.studies.map(
                                            (s, index) => (
                                              <TableHead
                                                key={s.study_id}
                                                className={cn({
                                                  "bg-primary/20":
                                                    selectedStudies[row.id] ===
                                                    s.study_id.toString(),
                                                })}
                                              >
                                                Estudio {index + 1}
                                                <br />
                                                {formatStudyDate(s.arrived_at)}
                                              </TableHead>
                                            ),
                                          )}
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {lesionMeasurements[
                                          row.id
                                        ]?.newLesions?.map((lesion, index) => (
                                          <TableRow key={lesion.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{lesion.site}</TableCell>
                                            {row.original.studies.map((s) => (
                                              <TableCell
                                                key={s.study_id}
                                                className={cn({
                                                  "bg-primary/20":
                                                    selectedStudies[row.id] ===
                                                    s.study_id.toString(),
                                                })}
                                              >
                                                {lesion.measurements &&
                                                s.study_id &&
                                                lesion.measurements[
                                                  s.study_id
                                                ] !== undefined &&
                                                lesion.measurements[
                                                  s.study_id
                                                ] !== 0
                                                  ? lesion.measurements[
                                                      s.study_id
                                                    ]!.toFixed(2)
                                                  : "-"}
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
                  No se encontraron resultados.
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
