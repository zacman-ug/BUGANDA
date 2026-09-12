const prisma = require('./prisma');

async function logAudit({ userId, action, entityType = null, entityId = null, changes = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId != null ? Number(entityId) : null,
        changes: changes || undefined
      }
    });
  } catch (err) {
    console.warn('Audit log write failed:', err.message);
  }
}

module.exports = { logAudit };
