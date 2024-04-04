"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0, //custom initial page index
        pageSize: 15, //custom default page size
      },
    },
  });

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpanded = useCallback((rowId: string) => {
    // only allow one row to be expanded at a time
    setExpandedRows((prev) => {
      return {
        ...prev,
        [rowId]: !prev[rowId],
      };
    });
  }, []);

  return (
    <div>
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
                <Collapsible key={row.id} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="group cursor-pointer appearance-none"
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
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      asChild
                      className="bg-muted/30 hover:bg-muted/40"
                    >
                      <TableRow>
                        <TableCell colSpan={columns.length + 1}>
                          <div className="flex flex-col gap-y-2">
                            <h3 className="text-lg font-bold ">
                              Revisar exámen:
                            </h3>
                            <div className="flex gap-3">
                              <Button variant="outline" className="gap-2">
                                <Image
                                  src={"/icons/slicer-icon.svg"}
                                  alt={"ohif icon"}
                                  width="25"
                                  height="25"
                                />
                                <span>3D Slicer</span>
                                <ChevronsRight className="h-5 w-5 rounded-full bg-primary/50" />
                              </Button>
                              <Link
                                href={
                                  "https://segmai.scian.cl/pacs/ohif/viewer?StudyInstanceUIDs=1.3.51.0.1.1.172.19.3.128.3030580.3030519"
                                }
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
                              Informacion adicional:
                            </h3>
                            <ul className="list-inside list-disc">
                              <li>
                                <span className="font-bold">Revisado por:</span>{" "}
                                {/* woman name */}
                                Roberto Gómez
                              </li>
                              <li>
                                <span className="font-bold">
                                  Número total de lesiones encontradas:
                                </span>{" "}
                                3
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
                                  <TableHead>
                                    Diámetro Axial Mayor (mm)
                                  </TableHead>
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
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[15, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {table.getState().pagination.pageIndex + 1}
          {" de "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage();
              setExpandedRows({});
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:block">Anterior</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage();
              setExpandedRows({});
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="hidden sm:block">Siguiente</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
