const PROJECT_STATUSES = ['recruiting', 'in_progress', 'completed', 'cancelled'];
const COLLABORATION_TYPES = ['academic', 'hackathon', 'open_source', 'startup', 'hobby'];
const REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'];
const MEMBERSHIP_STATUSES = ['active', 'inactive', 'left', 'removed'];
const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const NOTIFICATION_TYPES = [
  'join_request_received',
  'join_request_accepted',
  'join_request_rejected',
  'member_added',
  'member_removed',
  'project_status_changed',
];

const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile App',
  'AI & Machine Learning',
  'Cybersecurity',
  'Cloud & DevOps',
  'Data Science',
  'IoT & Hardware',
  'Game Development',
  'Blockchain',
  'Other',
];

module.exports = {
  PROJECT_STATUSES,
  COLLABORATION_TYPES,
  REQUEST_STATUSES,
  MEMBERSHIP_STATUSES,
  PROFICIENCY_LEVELS,
  NOTIFICATION_TYPES,
  PROJECT_CATEGORIES,
};

