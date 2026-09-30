BEGIN;

INSERT INTO roles(name, description)
VALUES
  ('ADMIN','Full configuration and administration access'),
  ('MANAGER','Task management and team oversight'),
  ('USER','Standard task management access'),
  ('VIEWER','Read-only access')
ON CONFLICT(name) DO NOTHING;

INSERT INTO users(name,email,is_active)
VALUES
  ('Bishal Kumar Jaiswal','bishal@taskly.com',TRUE)
ON CONFLICT(email) DO NOTHING;

INSERT INTO task_categories(name,description,icon,color,sort_order)
VALUES
  ('Work','General work tasks','briefcase','#4F46E5',1),
  ('Personal','Personal productivity','user','#F59E0B',2),
  ('Study','Learning and study tasks','book-open','#10B981',3),
  ('Marketing','Marketing and content','megaphone','#EC4899',4),
  ('Operations','Operations and internal process','settings','#0EA5E9',5),
  ('Admissions','Admissions and counselling','graduation-cap','#8B5CF6',6),
  ('Finance','Finance and payments','wallet-cards','#16A34A',7)
ON CONFLICT(name) DO NOTHING;

INSERT INTO task_statuses(code,name,description,color,icon,sort_order,is_default,is_terminal)
VALUES
  ('NOT_STARTED','Not Started','Task has not been started','#64748B','circle',1,TRUE,FALSE),
  ('IN_PROGRESS','In Progress','Task is actively being worked on','#2563EB','loader-circle',2,FALSE,FALSE),
  ('COMPLETED','Completed','Task has been finished','#15803D','circle-check',3,FALSE,TRUE),
  ('ON_HOLD','On Hold','Task is temporarily paused','#B45309','pause-circle',4,FALSE,FALSE),
  ('BLOCKED','Blocked','Task cannot continue until a blocker is resolved','#DC2626','circle-alert',5,FALSE,FALSE)
ON CONFLICT(code) DO NOTHING;

INSERT INTO task_priorities(code,name,color,icon,sort_order,weight)
VALUES
  ('LOW','Low','#15803D','arrow-down',1,10),
  ('MEDIUM','Medium','#B45309','minus',2,20),
  ('HIGH','High','#DC2626','arrow-up',3,30),
  ('URGENT','Urgent','#991B1B','badge-alert',4,40)
ON CONFLICT(code) DO NOTHING;

INSERT INTO dashboard_widgets(code,name,widget_type,title,description,icon,color,default_width,sort_order,configuration_json)
VALUES
  ('TOTAL_TASKS','Total tasks','stat','Total tasks','All current tasks','list-checks','#FFAA00',3,1,'{}'),
  ('NOT_STARTED','Not started','stat','Not started','Tasks waiting to begin','circle','#64748B',3,2,'{}'),
  ('IN_PROGRESS','In progress','stat','In progress','Tasks currently active','loader-circle','#2563EB',3,3,'{}'),
  ('COMPLETED','Completed','stat','Completed','Finished tasks','circle-check','#15803D',3,4,'{}'),
  ('OVERDUE','Overdue','stat','Overdue','Tasks past the due date','triangle-alert','#DC2626',3,5,'{}'),
  ('COMPLETION_RATE','Completion rate','progress','Today''s progress','Overall completion rate','chart-no-axes-combined','#FFAA00',6,6,'{}'),
  ('UPCOMING','Upcoming deadlines','list','Upcoming deadlines','Nearest incomplete due dates','calendar-clock','#FFAA00',6,7,'{}')
ON CONFLICT(code) DO NOTHING;

INSERT INTO custom_fields(name,field_key,field_type,entity_type,options_json,sort_order)
VALUES
  ('Task Type','task_type','select','task','["Internal","Client","Student","Campaign"]',1),
  ('Reference Number','reference_number','text','task','[]',2),
  ('Follow-up Date','follow_up_date','date','task','[]',3),
  ('External Link','external_link','url','task','[]',4)
ON CONFLICT(field_key) DO NOTHING;

INSERT INTO system_settings(setting_key,setting_value,data_type,description,is_public)
VALUES
  ('app.name','Taskly Task Manager','string','Application name',TRUE),
  ('app.primary_color','#FFAA00','color','Taskly brand primary color',TRUE),
  ('app.dark_color','#101827','color','Dark sidebar color',TRUE),
  ('app.default_page_size','20','number','Default task page size',TRUE),
  ('app.default_timezone','Asia/Kathmandu','string','Default application timezone',TRUE)
ON CONFLICT(setting_key) DO NOTHING;

-- Demo tasks
INSERT INTO tasks(title,description,status_id,priority_id,category_id,due_date,sort_order)
SELECT
  'Finalize Taskly content plan',
  'Finalize the content calendar, topics, and publishing schedule for the next campaign.',
  (SELECT id FROM task_statuses WHERE code='IN_PROGRESS'),
  (SELECT id FROM task_priorities WHERE code='HIGH'),
  (SELECT id FROM task_categories WHERE name='Marketing'),
  CURRENT_DATE,
  1
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title='Finalize Taskly content plan');

INSERT INTO tasks(title,description,status_id,priority_id,category_id,due_date,sort_order)
SELECT
  'Review student application documents',
  'Verify all required academic and identity documents before submission.',
  (SELECT id FROM task_statuses WHERE code='NOT_STARTED'),
  (SELECT id FROM task_priorities WHERE code='MEDIUM'),
  (SELECT id FROM task_categories WHERE name='Admissions'),
  CURRENT_DATE,
  2
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title='Review student application documents');

INSERT INTO tasks(title,description,status_id,priority_id,category_id,due_date,sort_order)
SELECT
  'Prepare tomorrow''s team meeting',
  'Prepare agenda, discussion points, metrics, and action items.',
  (SELECT id FROM task_statuses WHERE code='COMPLETED'),
  (SELECT id FROM task_priorities WHERE code='HIGH'),
  (SELECT id FROM task_categories WHERE name='Work'),
  CURRENT_DATE,
  3
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title='Prepare tomorrow''s team meeting');

INSERT INTO tasks(title,description,status_id,priority_id,category_id,due_date,sort_order)
SELECT
  'Update CRM lead tracking system',
  'Add lead status rules, follow-up fields, and dashboard tracking improvements.',
  (SELECT id FROM task_statuses WHERE code='IN_PROGRESS'),
  (SELECT id FROM task_priorities WHERE code='MEDIUM'),
  (SELECT id FROM task_categories WHERE name='Operations'),
  CURRENT_DATE + 1,
  4
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title='Update CRM lead tracking system');

INSERT INTO tasks(title,description,status_id,priority_id,category_id,due_date,sort_order)
SELECT
  'Follow up on pending approval',
  'Follow up on the pending approval and document the response for the team.',
  (SELECT id FROM task_statuses WHERE code='NOT_STARTED'),
  (SELECT id FROM task_priorities WHERE code='HIGH'),
  (SELECT id FROM task_categories WHERE name='Operations'),
  CURRENT_DATE - 1,
  5
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title='Follow up on pending approval');

COMMIT;
