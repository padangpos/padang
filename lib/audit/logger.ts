import { AuditLog } from '../types/database';

export function recordAuditLog(
  storeId: string,
  action: string,
  targetEntity: string,
  entityId?: string,
  changes?: Record<string, unknown>,
  reason?: string
): AuditLog {
  const log: AuditLog = {
    id: `audit-${Date.now()}`,
    store_id: storeId,
    actor_id: 'user-current',
    action,
    target_entity: targetEntity,
    entity_id: entityId,
    changes,
    reason,
    created_at: new Date().toISOString(),
  };

  console.log('📌 [Audit Log Recorded]:', log);
  return log;
}
