import type { AnalysisRecord } from "../entities/Analysis";

export interface AnalysisRepository {
  save(record: AnalysisRecord): Promise<void>;
  findById(id: string): Promise<AnalysisRecord | null>;
  list(limit: number): Promise<AnalysisRecord[]>;
}
