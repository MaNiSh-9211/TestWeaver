import { storage } from '../storage';
import { testExecutor } from './testExecutor';
import { z } from 'zod';

// Jira webhook payload schema
const JiraWebhookSchema = z.object({
  issue: z.object({
    key: z.string(),
    fields: z.object({
      summary: z.string(),
      description: z.string().optional(),
      customfield_10000: z.string().optional(), // User story field
      customfield_10001: z.string().optional(), // Base URL field
      customfield_10002: z.object({           // Credentials field
        username: z.string().optional(),
        password: z.string().optional(),
      }).optional(),
    }),
  }),
  webhookEvent: z.string(),
});

export class WebhookHandler {
  async handleJiraWebhook(payload: any): Promise<void> {
    try {
      console.log('Processing Jira webhook payload:', JSON.stringify(payload, null, 2));

      // Validate the webhook payload
      const validatedPayload = JiraWebhookSchema.parse(payload);
      
      // Only process issue creation or updates
      if (!['jira:issue_created', 'jira:issue_updated'].includes(validatedPayload.webhookEvent)) {
        console.log(`Ignoring webhook event: ${validatedPayload.webhookEvent}`);
        return;
      }

      const issue = validatedPayload.issue;
      const fields = issue.fields;

      // Extract test information from custom fields
      const userStory = fields.customfield_10000 || fields.description || fields.summary;
      const baseUrl = fields.customfield_10001;
      const credentials = fields.customfield_10002;

      if (!userStory) {
        throw new Error('No user story found in the Jira ticket');
      }

      if (!baseUrl) {
        throw new Error('No base URL found in the Jira ticket');
      }

      console.log(`Processing test for ticket ${issue.key}:`);
      console.log(`- User Story: ${userStory}`);
      console.log(`- Base URL: ${baseUrl}`);
      console.log(`- Has Credentials: ${!!credentials}`);

      // Find or create a test project for this base URL
      let project = await this.findOrCreateProject(baseUrl, credentials);

      // Create a test execution
      const execution = await storage.createTestExecution({
        projectId: project.id,
        jiraTicketId: issue.key,
        userStory: userStory,
        status: 'pending',
      });

      console.log(`Created test execution ${execution.id} for ticket ${issue.key}`);

      // Start the test execution asynchronously
      testExecutor.executeTest(execution.id).catch(error => {
        console.error(`Test execution ${execution.id} failed:`, error);
      });

    } catch (error) {
      console.error('Error processing Jira webhook:', error);
      throw error;
    }
  }

  private async findOrCreateProject(
    baseUrl: string,
    credentials?: { username?: string; password?: string }
  ) {
    // Try to find existing project with the same base URL
    const existingProjects = await storage.getTestProjects();
    const existingProject = existingProjects.find(p => p.baseUrl === baseUrl);

    if (existingProject) {
      console.log(`Using existing project ${existingProject.id} for ${baseUrl}`);
      return existingProject;
    }

    // Create new project
    const projectData = {
      name: `Auto-generated project for ${new URL(baseUrl).hostname}`,
      description: `Automatically created from Jira webhook for ${baseUrl}`,
      baseUrl: baseUrl,
      authRequired: !!credentials,
      authCredentials: credentials ? {
        username: credentials.username || '',
        password: credentials.password || '',
        type: 'basic' as const,
      } : null,
      isActive: true,
      createdBy: null, // System-created project
    };

    const newProject = await storage.createTestProject(projectData);
    console.log(`Created new project ${newProject.id} for ${baseUrl}`);
    
    return newProject;
  }

  // Helper method for manual webhook testing
  async simulateJiraWebhook(
    ticketKey: string,
    userStory: string,
    baseUrl: string,
    credentials?: { username: string; password: string }
  ): Promise<void> {
    const simulatedPayload = {
      issue: {
        key: ticketKey,
        fields: {
          summary: `Test ticket: ${ticketKey}`,
          description: userStory,
          customfield_10000: userStory,
          customfield_10001: baseUrl,
          customfield_10002: credentials,
        },
      },
      webhookEvent: 'jira:issue_created',
    };

    await this.handleJiraWebhook(simulatedPayload);
  }
}

export const webhookHandler = new WebhookHandler();
