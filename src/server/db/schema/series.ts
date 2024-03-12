import { z } from "zod";

export type Serie = {
  serie_id: number;
  serie_name: string;
  serie_uuid: string;
  serie_status: string;
  study_id: number;
  study_uuid: string;
  patient_code: string;
};

export const SerieSchema = z.object({
  serie_id: z.number(),
  serie_name: z.string(),
  serie_uuid: z.string(),
  serie_status: z.string(),
  study_id: z.number(),
  study_uuid: z.string(),
  patient_code: z.string(),
});

export const insertSerieSchema = z.object({
  serie_name: z.string(),
  serie_status: z.string(),
  study_id: z.number(),
  patient_code: z.string(),
});

export const insertSerieParams = z.object({
  serie_name: z.string(),
  serie_status: z.string(),
  study_id: z.number(),
  patient_code: z.string(),
});

export type NewSerie = z.infer<typeof insertSerieSchema>;
export type NewSerieParams = z.infer<typeof insertSerieSchema>;
