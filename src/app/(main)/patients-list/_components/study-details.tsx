"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Study } from "./columns";
import { ChevronsRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface StudyDetailsProps {
  study: Study;
}

export function StudyDetails({ study }: StudyDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Estudio: {study.name} (ID: {study.id})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Link
            href={`https://segmai.scian.cl/pacs/ohif/viewer?StudyInstanceUIDs=${study.uuid}`}
            target="_blank"
          >
            <Button variant="outline" className="gap-2">
              <Image
                src={"/tchaii/icons/ohif-icon-32x32.png"}
                alt={"ohif viewer icon"}
                width="25"
                height="25"
              />
              <span>OHIF Viewer</span>
              <ChevronsRight className="h-5 w-5 rounded-full bg-primary/50" />
            </Button>
          </Link>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Series:</h4>
          <ul className="list-inside list-disc">
            {study.series?.map((serie) => <li key={serie.id}>{serie.name}</li>)}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Fecha de recepción:</p>
            <p>{new Date(study.arrived_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-semibold">Fecha de segmentación:</p>
            <p>
              {study.segmentation_loaded_at
                ? new Date(study.segmentation_loaded_at).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
