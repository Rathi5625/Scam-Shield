import type { HistoryRecord } from '../../types/history';

/**
 * ScanHistoryRepository
 * Abstract contract for managing persisted scan records.
 * Local implementations use browser localStorage.
 * Future cloud implementations will route to Spring Boot / DynamoDB without modifying the UI layer.
 */
export interface ScanHistoryRepository {
  /**
   * Persists a new scan record.
   */
  saveScan(record: HistoryRecord): Promise<void>;

  /**
   * Retrieves all scan records sorted in descending chronological order.
   */
  getAllScans(): Promise<HistoryRecord[]>;

  /**
   * Retrieves a specific scan record by unique identifier.
   */
  getScanById(id: string): Promise<HistoryRecord | null>;

  /**
   * Deletes a specific scan record. Returns true if removed, false if not found.
   */
  deleteScan(id: string): Promise<boolean>;

  /**
   * Purges all saved scan records.
   */
  clearAllScans(): Promise<void>;
}
