import { apiClient } from './apiClient';

export interface OperationalRoot {
  root: string;
  operationalFunction: string;
}

export interface OperationalInsightResponse {
  success: boolean;
  data: {
    ayah: {
      id: string;
      surahNo: number;
      ayahNo: number;
      text: string;
    };
    rootsInAyah: string[];
    operationalRoots: OperationalRoot[];
    analysis: {
      provider: string;
      model: string;
      content: string;
      generatedAt: string;
    } | null;
    message?: string;
  };
}

export interface OperationalInsightPayload {
  surahNo: number;
  ayahNo: number;
  ayahText: string;
}

export async function fetchOperationalInsight(payload: OperationalInsightPayload) {
  return apiClient.post<OperationalInsightResponse>('/ai/operational-insight', payload);
}

