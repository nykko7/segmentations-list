import { z } from "zod";

export type Serie = {
  series_id: number;
  series_name: string;
  series_uuid: string;
  series_status: string;
  study_id: number;
  study_uuid: string;
  patient_code: string;
};

export const SerieSchema = z.object({
  series_id: z.number(),
  series_name: z.string(),
  series_uuid: z.string(),
  series_status: z.string(),
  study_id: z.number(),
  study_uuid: z.string(),
  patient_code: z.string(),
});

export const insertSerieSchema = z.object({
  series_name: z.string(),
  series_status: z.string(),
  study_id: z.number(),
  patient_code: z.string(),
});

export const insertSerieParams = z.object({
  series_name: z.string(),
  series_status: z.string(),
  study_id: z.number(),
  patient_code: z.string(),
});

export type NewSerie = z.infer<typeof insertSerieSchema>;
export type NewSerieParams = z.infer<typeof insertSerieSchema>;
