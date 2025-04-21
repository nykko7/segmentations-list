// import { date, timestamp, varchar } from "drizzle-orm/pg-core";
// import { createTable } from "../utils";

import { z } from "zod";

// export const medicalCheck = createTable("medicalCheck", {
//   id: varchar("medicalCheckId", { length: 255 }).notNull().primaryKey(),
//   orthanc_uuid: varchar("orthanc_uuid", { length: 255 }).notNull(),
//   status: timestamp("status").notNull(),
//   createdAt: date("createdAt").notNull(),
//   updatedAt: date("updatedAt").notNull(),
// });

export type MedicalCheck = {
  id: string;
  code: string;
  studies: {
    id: string;
    uuid: string;
    name: string;
    status:
      | "reviewed"
      | "not_reviewed"
      | "created"
      | "processing"
      | "partially_processed"
      | "failed"
      | "error"
      | "fully_processed";
    arrived_at?: string | null;
    segmentation_loaded_at?: string | null;
    series: Array<{
      series_instance_uid: string;
      segmentations: Array<{
        id: string;
        created_at: string;
        updated_at: string;
        is_deleted: boolean;
        name: string;
        segmentation_id: string | null;
        orthanc_id: string;
        status: string;
        series_instance_uid: string;
        series: string;
        segments: Array<{
          id: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
          name: string;
          label: string;
          tracking_id: string;
          affected_organs: string;
          volume: number;
          axial_diameter: number | null;
          coronal_diameter: number | null;
          sagittal_diameter: number | null;
          lession_classification: string;
          lession_type: string;
          segmentation_type: string;
          window_width: number | null;
          window_level: number | null;
          status: string;
          lesion_segmentation: string;
          user: string | null;
          reviewed_by: string | null;
          model: string | null;
          lesion_segments: string[];
        }>;
      }>;
    }>;
    related_studies_ids: string[];
    is_basal: boolean;
  }[];
};

export const MedicalCheckSchema = z.object({
  id: z.string(),
  code: z.string(),
  studies: z.array(
    z.object({
      id: z.string(),
      uuid: z.string(),
      name: z.string(),
      status: z.enum(["reviewed", "not_reviewed"]),
      arrived_at: z.string().nullable().optional(),
      segmentation_loaded_at: z.string().nullable().optional(),
      series: z.array(
        z.object({
          series_instance_uid: z.string(),
          segmentations: z.array(
            z.object({
              id: z.string(),
              created_at: z.string(),
              updated_at: z.string(),
              is_deleted: z.boolean(),
              name: z.string(),
              segmentation_id: z.string().nullable(),
              orthanc_id: z.string(),
              status: z.string(),
              series_instance_uid: z.string(),
              series: z.string(),
              segments: z.array(
                z.object({
                  id: z.string(),
                  created_at: z.string(),
                  updated_at: z.string(),
                  is_deleted: z.boolean(),
                  name: z.string(),
                  label: z.string(),
                  tracking_id: z.string(),
                  affected_organs: z.string(),
                  volume: z.number(),
                  axial_diameter: z.number().nullable(),
                  coronal_diameter: z.number().nullable(),
                  sagittal_diameter: z.number().nullable(),
                  lession_classification: z.string(),
                  lession_type: z.string(),
                  segmentation_type: z.string(),
                  window_width: z.number().nullable(),
                  window_level: z.number().nullable(),
                  status: z.string(),
                  lesion_segmentation: z.string(),
                  user: z.string().nullable(),
                  reviewed_by: z.string().nullable(),
                  model: z.string().nullable(),
                  lesion_segments: z.array(z.string()),
                }),
              ),
            }),
          ),
        }),
      ),
      related_studies_ids: z.array(z.string()),
      is_basal: z.boolean(),
    }),
  ),
});
