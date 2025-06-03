import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { type MedicalCheck } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export type StudyResponse = Record<
  string,
  {
    related_studies_ids: string[];
    study_id: string;
    study_date: string;
    is_basal: boolean;
    status:
      | "reviewed"
      | "not_reviewed"
      | "created"
      | "processing"
      | "partially_processed"
      | "failed"
      | "error"
      | "fully_processed";
    series: Array<{
      series_instance_uid: string;
      series_name: string;
      body_region: string;
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
  }
>;

export const medicalCheckRouter = createTRPCRouter({
  getAllPublic: publicProcedure
    .input(
      z
        .object({
          accessionNumber: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const res = await fetch(
        "https://segmai.scian.cl/gateway_api/core/pipeline/api/v1/studies/",
      );

      if (!res.ok) {
        throw new Error("Failed to fetch studies");
      }

      const data = (await res.json()) as StudyResponse;

      // Transform the data to match the expected format
      const studies = Object.entries(data).map(([studyId, studyData]) => {
        return {
          id: studyId,
          uuid: studyId,
          name: studyData.series[0]?.segmentations[0]?.name ?? "Unknown",
          status: studyData.status,
          arrived_at: studyData.study_date,
          segmentation_loaded_at:
            studyData.series[0]?.segmentations[0]?.segments[0]?.created_at ??
            null,
          series: studyData.series.map((series) => ({
            series_instance_uid: series.series_instance_uid,
            series_name: series.series_name,
            body_region: series.body_region,
            segmentations: series.segmentations.map((segmentation) => ({
              id: segmentation.id,
              created_at: segmentation.created_at,
              updated_at: segmentation.updated_at,
              is_deleted: segmentation.is_deleted,
              name: segmentation.name,
              segmentation_id: segmentation.segmentation_id,
              orthanc_id: segmentation.orthanc_id,
              status: segmentation.status,
              series_instance_uid: segmentation.series_instance_uid,
              series: segmentation.series,
              segments: segmentation.segments.map((segment) => ({
                id: segment.id,
                created_at: segment.created_at,
                updated_at: segment.updated_at,
                is_deleted: segment.is_deleted,
                name: segment.name,
                label: segment.label,
                tracking_id: segment.tracking_id,
                affected_organs: segment.affected_organs,
                volume: segment.volume,
                axial_diameter: segment.axial_diameter,
                coronal_diameter: segment.coronal_diameter,
                sagittal_diameter: segment.sagittal_diameter,
                lession_classification: segment.lession_classification,
                lession_type: segment.lession_type,
                segmentation_type: segment.segmentation_type,
                window_width: segment.window_width,
                window_level: segment.window_level,
                status: segment.status,
                lesion_segmentation: segment.lesion_segmentation,
                user: segment.user,
                reviewed_by: segment.reviewed_by,
                model: segment.model,
                lesion_segments: segment.lesion_segments,
              })),
            })),
          })),
          related_studies_ids: studyData.related_studies_ids,
          is_basal: studyData.is_basal,
        };
      });

      // Group studies by their related_studies_ids to create medical checks
      const medicalChecksMap = new Map<string, MedicalCheck>();

      studies.forEach((study) => {
        const relatedIds = study.related_studies_ids;
        if (!relatedIds?.length) return;

        const firstStudyId = relatedIds[0];
        if (!firstStudyId) return;

        if (!medicalChecksMap.has(firstStudyId)) {
          medicalChecksMap.set(firstStudyId, {
            id: firstStudyId,
            code: firstStudyId.split(".").slice(-2).join("-"),
            studies: [],
          });
        }

        const medicalCheck = medicalChecksMap.get(firstStudyId);
        if (medicalCheck) {
          medicalCheck.studies.push(study);
        }
      });

      // Get all medical checks
      let result = Array.from(medicalChecksMap.values());

      // Filter by accession number if provided
      if (input?.accessionNumber && input.accessionNumber.trim() !== "") {
        result = result.filter((medicalCheck) => {
          return medicalCheck.studies.some((study) => {
            // Check if the study ID/UUID contains the accession number
            return study.id
              .toLowerCase()
              .includes(input.accessionNumber!.toLowerCase());
          });
        });
      }

      console.log("Result: ", JSON.stringify(result));
      return result;
    }),

  getAllPrivate: protectedProcedure.query(async ({ ctx }) => {
    const res = await fetch(
      "https://segmai.scian.cl/gateway_api/core/pipeline/api/v1/studies/",
      {
        headers: ctx.headers,
        cache: "no-cache",
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      throw new Error("Failed to fetch studies");
    }

    const data = (await res.json()) as StudyResponse;

    // Transform the data to match the expected format
    const studies = Object.entries(data).map(([studyId, studyData]) => {
      return {
        id: studyId,
        uuid: studyId,
        name: studyData.series[0]?.segmentations[0]?.name ?? "Unknown",
        status: studyData.status,
        arrived_at: studyData.study_date,
        segmentation_loaded_at:
          studyData.series[0]?.segmentations[0]?.segments[0]?.created_at ??
          null,
        series: studyData.series.map((series) => ({
          series_instance_uid: series.series_instance_uid,
          series_name: series.series_name,
          body_region: series.body_region,
          segmentations: series.segmentations.map((segmentation) => ({
            id: segmentation.id,
            created_at: segmentation.created_at,
            updated_at: segmentation.updated_at,
            is_deleted: segmentation.is_deleted,
            name: segmentation.name,
            segmentation_id: segmentation.segmentation_id,
            orthanc_id: segmentation.orthanc_id,
            status: segmentation.status,
            series_instance_uid: segmentation.series_instance_uid,
            series: segmentation.series,
            segments: segmentation.segments.map((segment) => ({
              id: segment.id,
              created_at: segment.created_at,
              updated_at: segment.updated_at,
              is_deleted: segment.is_deleted,
              name: segment.name,
              label: segment.label,
              tracking_id: segment.tracking_id,
              affected_organs: segment.affected_organs,
              volume: segment.volume,
              axial_diameter: segment.axial_diameter,
              coronal_diameter: segment.coronal_diameter,
              sagittal_diameter: segment.sagittal_diameter,
              lession_classification: segment.lession_classification,
              lession_type: segment.lession_type,
              segmentation_type: segment.segmentation_type,
              window_width: segment.window_width,
              window_level: segment.window_level,
              status: segment.status,
              lesion_segmentation: segment.lesion_segmentation,
              user: segment.user,
              reviewed_by: segment.reviewed_by,
              model: segment.model,
              lesion_segments: segment.lesion_segments,
            })),
          })),
        })),
        related_studies_ids: studyData.related_studies_ids,
        is_basal: studyData.is_basal,
      };
    });

    const medicalChecksMap = new Map<string, MedicalCheck>();

    studies.forEach((study) => {
      const relatedIds = study.related_studies_ids;
      if (!relatedIds?.length) return;

      const firstStudyId = relatedIds[0];
      if (!firstStudyId) return;

      if (!medicalChecksMap.has(firstStudyId)) {
        medicalChecksMap.set(firstStudyId, {
          id: firstStudyId,
          code: firstStudyId.split(".").slice(-2).join("-"),
          studies: [],
        });
      }

      const medicalCheck = medicalChecksMap.get(firstStudyId);
      if (medicalCheck) {
        medicalCheck.studies.push(study);
      }
    });

    const result = Array.from(medicalChecksMap.values());
    return result;
  }),
});
