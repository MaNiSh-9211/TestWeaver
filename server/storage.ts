import {
  users,
  testProjects,
  testExecutions,
  testSteps,
  scrapedPages,
  type User,
  type UpsertUser,
  type TestProject,
  type InsertTestProject,
  type TestExecution,
  type InsertTestExecution,
  type TestStep,
  type InsertTestStep,
  type ScrapedPage,
  type InsertScrapedPage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Test Project operations
  createTestProject(project: InsertTestProject): Promise<TestProject>;
  getTestProject(id: number): Promise<TestProject | undefined>;
  getTestProjects(userId?: string): Promise<TestProject[]>;
  updateTestProject(id: number, updates: Partial<InsertTestProject>): Promise<TestProject>;
  deleteTestProject(id: number): Promise<void>;

  // Test Execution operations
  createTestExecution(execution: InsertTestExecution): Promise<TestExecution>;
  getTestExecution(id: number): Promise<TestExecution | undefined>;
  getTestExecutions(projectId: number): Promise<TestExecution[]>;
  updateTestExecution(id: number, updates: Partial<InsertTestExecution>): Promise<TestExecution>;

  // Test Step operations
  createTestStep(step: InsertTestStep): Promise<TestStep>;
  getTestSteps(executionId: number): Promise<TestStep[]>;
  updateTestStep(id: number, updates: Partial<InsertTestStep>): Promise<TestStep>;

  // Scraped Page operations
  createScrapedPage(page: InsertScrapedPage): Promise<ScrapedPage>;
  getScrapedPage(projectId: number, url: string): Promise<ScrapedPage | undefined>;
  getScrapedPages(projectId: number): Promise<ScrapedPage[]>;
  updateScrapedPage(id: number, updates: Partial<InsertScrapedPage>): Promise<ScrapedPage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Test Project operations
  async createTestProject(project: InsertTestProject): Promise<TestProject> {
    const [created] = await db
      .insert(testProjects)
      .values(project)
      .returning();
    return created;
  }

  async getTestProject(id: number): Promise<TestProject | undefined> {
    const [project] = await db
      .select()
      .from(testProjects)
      .where(eq(testProjects.id, id));
    return project;
  }

  async getTestProjects(userId?: string): Promise<TestProject[]> {
    const query = db.select().from(testProjects).orderBy(desc(testProjects.createdAt));
    
    if (userId) {
      return query.where(eq(testProjects.createdBy, userId));
    }
    
    return query;
  }

  async updateTestProject(id: number, updates: Partial<InsertTestProject>): Promise<TestProject> {
    const [updated] = await db
      .update(testProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(testProjects.id, id))
      .returning();
    return updated;
  }

  async deleteTestProject(id: number): Promise<void> {
    await db.delete(testProjects).where(eq(testProjects.id, id));
  }

  // Test Execution operations
  async createTestExecution(execution: InsertTestExecution): Promise<TestExecution> {
    const [created] = await db
      .insert(testExecutions)
      .values({
        projectId: execution.projectId,
        status: execution.status,
        userStory: execution.userStory,
        jiraTicketId: execution.jiraTicketId || null,
        startedAt: execution.startedAt || new Date(),
        completedAt: execution.completedAt || null,
        totalSteps: execution.totalSteps || 0,
        completedSteps: execution.completedSteps || 0,
        errorMessage: execution.errorMessage || null,
        reportData: execution.reportData || null,
        screenshotPaths: execution.screenshotPaths || []
      })
      .returning();
    return created;
  }

  async getTestExecution(id: number): Promise<TestExecution | undefined> {
    const [execution] = await db
      .select()
      .from(testExecutions)
      .where(eq(testExecutions.id, id));
    return execution;
  }

  async getTestExecutions(projectId: number): Promise<TestExecution[]> {
    return db
      .select()
      .from(testExecutions)
      .where(eq(testExecutions.projectId, projectId))
      .orderBy(desc(testExecutions.createdAt));
  }

  async updateTestExecution(id: number, updates: Partial<InsertTestExecution>): Promise<TestExecution> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.userStory !== undefined) updateData.userStory = updates.userStory;
    if (updates.jiraTicketId !== undefined) updateData.jiraTicketId = updates.jiraTicketId;
    if (updates.startedAt !== undefined) updateData.startedAt = updates.startedAt;
    if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;
    if (updates.totalSteps !== undefined) updateData.totalSteps = updates.totalSteps;
    if (updates.completedSteps !== undefined) updateData.completedSteps = updates.completedSteps;
    if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;
    if (updates.reportData !== undefined) updateData.reportData = updates.reportData;
    if (updates.screenshotPaths !== undefined) updateData.screenshotPaths = updates.screenshotPaths;

    const [updated] = await db
      .update(testExecutions)
      .set(updateData)
      .where(eq(testExecutions.id, id))
      .returning();
    return updated;
  }

  // Test Step operations
  async createTestStep(step: InsertTestStep): Promise<TestStep> {
    const [created] = await db
      .insert(testSteps)
      .values({
        executionId: step.executionId,
        stepNumber: step.stepNumber,
        description: step.description,
        status: step.status,
        aiGeneratedScript: step.aiGeneratedScript || null,
        executionTime: step.executionTime || null,
        errorMessage: step.errorMessage || null,
        screenshotPath: step.screenshotPath || null,
        pageUrl: step.pageUrl || null,
        extractedSelectors: step.extractedSelectors || []
      })
      .returning();
    return created;
  }

  async getTestSteps(executionId: number): Promise<TestStep[]> {
    return db
      .select()
      .from(testSteps)
      .where(eq(testSteps.executionId, executionId))
      .orderBy(testSteps.stepNumber);
  }

  async updateTestStep(id: number, updates: Partial<InsertTestStep>): Promise<TestStep> {
    const updateData: any = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.aiGeneratedScript !== undefined) updateData.aiGeneratedScript = updates.aiGeneratedScript;
    if (updates.executionTime !== undefined) updateData.executionTime = updates.executionTime;
    if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;
    if (updates.screenshotPath !== undefined) updateData.screenshotPath = updates.screenshotPath;
    if (updates.pageUrl !== undefined) updateData.pageUrl = updates.pageUrl;
    if (updates.extractedSelectors !== undefined) updateData.extractedSelectors = updates.extractedSelectors;

    const [updated] = await db
      .update(testSteps)
      .set(updateData)
      .where(eq(testSteps.id, id))
      .returning();
    return updated;
  }

  // Scraped Page operations
  async createScrapedPage(page: InsertScrapedPage): Promise<ScrapedPage> {
    const [created] = await db
      .insert(scrapedPages)
      .values({
        projectId: page.projectId,
        url: page.url,
        htmlContent: page.htmlContent || null,
        extractedSelectors: page.extractedSelectors || {},
        isAuthRequired: page.isAuthRequired || false,
        screenshots: page.screenshots || [],
        lastScrapedAt: page.lastScrapedAt || new Date()
      })
      .returning();
    return created;
  }

  async getScrapedPage(projectId: number, url: string): Promise<ScrapedPage | undefined> {
    const [page] = await db
      .select()
      .from(scrapedPages)
      .where(and(eq(scrapedPages.projectId, projectId), eq(scrapedPages.url, url)));
    return page;
  }

  async getScrapedPages(projectId: number): Promise<ScrapedPage[]> {
    return db
      .select()
      .from(scrapedPages)
      .where(eq(scrapedPages.projectId, projectId))
      .orderBy(desc(scrapedPages.lastScrapedAt));
  }

  async updateScrapedPage(id: number, updates: Partial<InsertScrapedPage>): Promise<ScrapedPage> {
    const updateData: any = { lastScrapedAt: new Date() };
    if (updates.projectId !== undefined) updateData.projectId = updates.projectId;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.htmlContent !== undefined) updateData.htmlContent = updates.htmlContent;
    if (updates.extractedSelectors !== undefined) updateData.extractedSelectors = updates.extractedSelectors;
    if (updates.isAuthRequired !== undefined) updateData.isAuthRequired = updates.isAuthRequired;
    if (updates.screenshots !== undefined) updateData.screenshots = updates.screenshots;

    const [updated] = await db
      .update(scrapedPages)
      .set(updateData)
      .where(eq(scrapedPages.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
