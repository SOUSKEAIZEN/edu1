exports.up = (pgm) => {
  // Frequently queried lookup indexes
  pgm.createIndex('mentor_student_assignments', 'mentor_id');
  pgm.createIndex('mentor_student_assignments', 'student_id');
  pgm.createIndex('student_metric_snapshots', ['student_id', 'snapshot_date']);
  pgm.createIndex('risk_snapshots', ['student_id', 'snapshot_date']);
  pgm.createIndex('ai_messages', ['conversation_id', 'created_at']);
  pgm.createIndex('document_chunks', 'version_id');
  
  // Partial index for outbox worker to quickly find pending events
  pgm.createIndex('outbox_events', 'status', { where: "status = 'PENDING'" });
};

exports.down = (pgm) => {
  pgm.dropIndex('mentor_student_assignments', 'mentor_id');
  pgm.dropIndex('mentor_student_assignments', 'student_id');
  pgm.dropIndex('student_metric_snapshots', ['student_id', 'snapshot_date']);
  pgm.dropIndex('risk_snapshots', ['student_id', 'snapshot_date']);
  pgm.dropIndex('ai_messages', ['conversation_id', 'created_at']);
  pgm.dropIndex('document_chunks', 'version_id');
  pgm.dropIndex('outbox_events', 'status');
};
