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
  id: number;
  code: string;
  orthanc_uuid: string;
  status: number | null;
  studies: {
    id: number;
    name: string;
    uuid: string;
    status: number;
    orthanc_uuid: string;
    arrived_at?: string | null;
    segmentation_loaded_at?: string | null;
    series: {
      id: number;
      name: string;
      uuid: string;
      status: number;
      orthanc_uuid: string;
    }[];
  }[];
};

export const MedicalCheckSchema = z.object({
  id: z.number(),
  code: z.string(),
  orthanc_uuid: z.string(),
  status: z.number(),
  studies: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      uuid: z.string(),
      status: z.number(),
      orthanc_uuid: z.string(),
      series: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          uuid: z.string(),
          status: z.number(),
          orthanc_uuid: z.string(),
        }),
      ),
    }),
  ),
});
