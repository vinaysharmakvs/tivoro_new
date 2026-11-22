import {index,integer,sqliteTable,text,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const enquiries=sqliteTable('enquiries',{
 id:text('id').primaryKey(),submissionId:text('submission_id').notNull(),
 name:text('name').notNull(),business:text('business').notNull(),email:text('email').notNull(),
 service:text('service').notNull(),message:text('message').notNull(),status:text('status').notNull(),
 createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by'),
 payloadHash:text('payload_hash').notNull(),notificationState:text('notification_state').notNull(),notificationError:text('notification_error')
},table=>[uniqueIndex('enquiries_submission_unique').on(table.submissionId),index('enquiries_created_index').on(table.createdAt),index('enquiries_status_index').on(table.status)]);
export const enquiryLimits=sqliteTable('enquiry_limits',{
 key:text('key').primaryKey(),attempts:integer('attempts').notNull(),expiresAt:integer('expires_at').notNull()
},table=>[index('enquiry_limits_expiry_index').on(table.expiresAt)]);
