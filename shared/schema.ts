import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test Projects - Container for test configurations
export const testProjects = pgTable("test_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  baseUrl: text("base_url").notNull(),
  jiraWebhookUrl: text("jira_webhook_url"),
  authRequired: boolean("auth_required").default(false),
  authCredentials: jsonb("auth_credentials"), // {username, password, type: 'basic'|'oauth'}
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test Executions - Individual test runs
export const testExecutions = pgTable("test_executions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => testProjects.id).notNull(),
  jiraTicketId: text("jira_ticket_id"),
  userStory: text("user_story").notNull(),
  status: text("status").notNull(), // 'pending', 'running', 'completed', 'failed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  totalSteps: integer("total_steps").default(0),
  completedSteps: integer("completed_steps").default(0),
  failedSteps: integer("failed_steps").default(0),
  errorMessage: text("error_message"),
  reportData: jsonb("report_data"),
  screenshotPaths: jsonb("screenshot_paths").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Test Steps - Individual automation steps
export const testSteps = pgTable("test_steps", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => testExecutions.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  description: text("description").notNull(),
  aiGeneratedScript: text("ai_generated_script"),
  status: text("status").notNull(), // 'pending', 'running', 'completed', 'failed', 'skipped'
  executionTime: integer("execution_time"), // milliseconds
  errorMessage: text("error_message"),
  screenshotPath: text("screenshot_path"),
  pageUrl: text("page_url"),
  extractedSelectors: jsonb("extracted_selectors").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scraped Pages - Cache of scraped website data
export const scrapedPages = pgTable("scraped_pages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => testProjects.id).notNull(),
  url: text("url").notNull(),
  htmlContent: text("html_content"),
  extractedSelectors: jsonb("extracted_selectors").$type<Record<string, string[]>>(),
  pageTitle: text("page_title"),
  isAuthRequired: boolean("is_auth_required").default(false),
  screenshots: jsonb("screenshots").$type<string[]>().default([]),
  lastScrapedAt: timestamp("last_scraped_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});



// below 2 added myself
// AI Conversations - Track AI interactions
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => testExecutions.id).notNull(),
  stepId: integer("step_id").references(() => testSteps.id),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  model: text("model").notNull(),
  tokensUsed: integer("tokens_used").default(0),
  responseTime: integer("response_time").default(0), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Test Configurations - Store test automation configurations
export const testConfigurations = pgTable("test_configurations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => testProjects.id).notNull(),
  name: text("name").notNull(),
  targetUrl: text("target_url").notNull(),
  userStory: text("user_story").notNull(),
  credentials: jsonb("credentials").$type<{
    username?: string;
    password?: string;
    type: 'basic' | 'oauth';
  }>(),
  maxSteps: integer("max_steps").default(20),
  timeout: integer("timeout").default(30000), // milliseconds
  retryCount: integer("retry_count").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});




// Relations
export const testProjectsRelations = relations(testProjects, ({ many, one }) => ({
  executions: many(testExecutions),
  scrapedPages: many(scrapedPages),
  creator: one(users, {
    fields: [testProjects.createdBy],
    references: [users.id],
  }),
}));

export const testExecutionsRelations = relations(testExecutions, ({ one, many }) => ({
  project: one(testProjects, {
    fields: [testExecutions.projectId],
    references: [testProjects.id],
  }),
  steps: many(testSteps),
}));

export const testStepsRelations = relations(testSteps, ({ one }) => ({
  execution: one(testExecutions, {
    fields: [testSteps.executionId],
    references: [testExecutions.id],
  }),
}));

export const scrapedPagesRelations = relations(scrapedPages, ({ one }) => ({
  project: one(testProjects, {
    fields: [scrapedPages.projectId],
    references: [testProjects.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTestProjectSchema = createInsertSchema(testProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestExecutionSchema = createInsertSchema(testExecutions).omit({
  id: true,
  createdAt: true,
});

export const insertTestStepSchema = createInsertSchema(testSteps).omit({
  id: true,
  createdAt: true,
});

export const insertScrapedPageSchema = createInsertSchema(scrapedPages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TestProject = typeof testProjects.$inferSelect;
export type InsertTestProject = z.infer<typeof insertTestProjectSchema>;
export type TestExecution = typeof testExecutions.$inferSelect;
export type InsertTestExecution = z.infer<typeof insertTestExecutionSchema>;
export type TestStep = typeof testSteps.$inferSelect;
export type InsertTestStep = z.infer<typeof insertTestStepSchema>;
export type ScrapedPage = typeof scrapedPages.$inferSelect;
export type InsertScrapedPage = z.infer<typeof insertScrapedPageSchema>;


// added myself

// Types for AI Conversations
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

// Types for Test Configurations
export type TestConfiguration = typeof testConfigurations.$inferSelect;
export type InsertTestConfiguration = typeof testConfigurations.$inferInsert;
