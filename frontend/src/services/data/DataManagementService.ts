/**
 * ScamShield — Local Data Management & Ephemeral Controls Service
 * 
 * Manages local browser storage inventory, ephemeral cache purging,
 * and emergency panic wipe (Purge All Data).
 * 
 * Complies with the Phase 7 Local-First Architecture.
 */

export interface StorageInventory {
  totalEstimatedBytes: number;
  totalEstimatedKb: string;
  accountsCount: number;
  hasActiveSession: boolean;
  activeOperativeEmail?: string;
  scanHistoryCount: number;
  familyGroupsCount: number;
  familyInvitesCount: number;
  familyThreatsCount: number;
  temporaryItemsCount: number;
}

const STORAGE_KEYS = {
  USERS_DB: 'scamshield_users_db',
  SESSION_USER: 'scamshield_session_user',
  SCAN_HISTORY: 'scamshield_scan_history_v1',
  FAMILY_GROUPS: 'scamshield_family_groups_v1',
  FAMILY_INVITES: 'scamshield_family_invites_v1',
  FAMILY_THREATS: 'scamshield_family_threats_v1',
  TEMP_CACHE_PREFIX: 'scamshield_temp_',
  DIAGNOSTIC_CACHE: 'scamshield_diagnostic_cache',
  EPHEMERAL_LOGS: 'scamshield_ephemeral_logs',
};

class DataManagementService {
  /**
   * Scans localStorage and returns a breakdown of ScamShield data stores.
   */
  public getInventory(): StorageInventory {
    let totalBytes = 0;
    let accountsCount = 0;
    let hasActiveSession = false;
    let activeOperativeEmail: string | undefined = undefined;
    let scanHistoryCount = 0;
    let familyGroupsCount = 0;
    let familyInvitesCount = 0;
    let familyThreatsCount = 0;
    let temporaryItemsCount = 0;

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return {
          totalEstimatedBytes: 0,
          totalEstimatedKb: '0.00 KB',
          accountsCount: 0,
          hasActiveSession: false,
          scanHistoryCount: 0,
          familyGroupsCount: 0,
          familyInvitesCount: 0,
          familyThreatsCount: 0,
          temporaryItemsCount: 0,
        };
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('scamshield_')) continue;

        const val = localStorage.getItem(key) || '';
        totalBytes += key.length * 2 + val.length * 2; // Approximate UTF-16 bytes

        if (key === STORAGE_KEYS.USERS_DB) {
          try {
            const parsed = JSON.parse(val);
            accountsCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
          } catch {
            accountsCount = 1;
          }
        } else if (key === STORAGE_KEYS.SESSION_USER) {
          try {
            const parsed = JSON.parse(val);
            if (parsed && parsed.email) {
              hasActiveSession = true;
              activeOperativeEmail = parsed.email;
            }
          } catch {
            hasActiveSession = true;
          }
        } else if (key === STORAGE_KEYS.SCAN_HISTORY) {
          try {
            const parsed = JSON.parse(val);
            scanHistoryCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            scanHistoryCount = 0;
          }
        } else if (key === STORAGE_KEYS.FAMILY_GROUPS) {
          try {
            const parsed = JSON.parse(val);
            familyGroupsCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            familyGroupsCount = 0;
          }
        } else if (key === STORAGE_KEYS.FAMILY_INVITES) {
          try {
            const parsed = JSON.parse(val);
            familyInvitesCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            familyInvitesCount = 0;
          }
        } else if (key === STORAGE_KEYS.FAMILY_THREATS) {
          try {
            const parsed = JSON.parse(val);
            familyThreatsCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            familyThreatsCount = 0;
          }
        } else if (
          key.startsWith(STORAGE_KEYS.TEMP_CACHE_PREFIX) ||
          key === STORAGE_KEYS.DIAGNOSTIC_CACHE ||
          key === STORAGE_KEYS.EPHEMERAL_LOGS
        ) {
          temporaryItemsCount++;
        }
      }
    } catch (e) {
      console.warn('ScamShield [DATA SERVICE]: Inventory calculation error:', e);
    }

    return {
      totalEstimatedBytes: totalBytes,
      totalEstimatedKb: (totalBytes / 1024).toFixed(2) + ' KB',
      accountsCount,
      hasActiveSession,
      activeOperativeEmail,
      scanHistoryCount,
      familyGroupsCount,
      familyInvitesCount,
      familyThreatsCount,
      temporaryItemsCount,
    };
  }

  /**
   * Purge Temporary Data:
   * Cleans ephemeral diagnostics, temporary preview blobs, and ephemeral logs
   * WITHOUT deleting user credentials, active sessions, family groups, or permanent history.
   */
  public purgeTemporaryData(): { clearedKeys: string[]; bytesFreed: number } {
    const clearedKeys: string[] = [];
    let bytesFreed = 0;

    if (typeof window === 'undefined' || !window.localStorage) {
      return { clearedKeys, bytesFreed };
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (
          key.startsWith(STORAGE_KEYS.TEMP_CACHE_PREFIX) ||
          key === STORAGE_KEYS.DIAGNOSTIC_CACHE ||
          key === STORAGE_KEYS.EPHEMERAL_LOGS
        ) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        const val = localStorage.getItem(key) || '';
        bytesFreed += key.length * 2 + val.length * 2;
        localStorage.removeItem(key);
        clearedKeys.push(key);
      }
    } catch (e) {
      console.error('ScamShield [DATA SERVICE]: Failed to purge temporary cache:', e);
    }

    return { clearedKeys, bytesFreed };
  }

  /**
   * Delete Scan History:
   * Removes only the scan history archive key.
   */
  public deleteScanHistory(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      localStorage.removeItem(STORAGE_KEYS.SCAN_HISTORY);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Purge All Data (Panic Wipe):
   * Destructive operation that eradicates all 6 ScamShield keys and any transient data.
   * Signs the operative out completely.
   */
  public purgeAllData(): { success: boolean; clearedCount: number } {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, clearedCount: 0 };
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('scamshield_')) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }

      return { success: true, clearedCount: keysToRemove.length };
    } catch (e) {
      console.error('ScamShield [DATA SERVICE]: Failed to purge all data:', e);
      return { success: false, clearedCount: 0 };
    }
  }
}

export const dataManagementService = new DataManagementService();
