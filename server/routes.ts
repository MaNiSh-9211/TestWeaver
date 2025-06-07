import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { webhookHandler } from "./services/webhookHandler";
import { testExecutor } from "./services/testExecutor";
import { insertTestProjectSchema, insertTestExecutionSchema } from "@shared/schema";
import { z } from "zod";

// Optional authentication middleware
const optionalAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Allow access without authentication
  req.user = null;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', optionalAuth, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Jira Webhook endpoint (public)
  app.post('/api/webhook/jira', async (req, res) => {
    try {
      console.log('Received Jira webhook:', req.body);
      await webhookHandler.handleJiraWebhook(req.body);
      res.json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test Projects API
  app.get('/api/projects', optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projects = await storage.getTestProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.post('/api/projects', optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projectData = insertTestProjectSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const project = await storage.createTestProject(projectData);
      res.json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create project' });
      }
    }
  });

  app.get('/api/projects/:id', optionalAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getTestProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.put('/api/projects/:id', optionalAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const updates = insertTestProjectSchema.partial().parse(req.body);
      
      const project = await storage.updateTestProject(projectId, updates);
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update project' });
      }
    }
  });

  app.delete('/api/projects/:id', optionalAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteTestProject(projectId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Test Executions API
  app.get('/api/projects/:projectId/executions', optionalAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const executions = await storage.getTestExecutions(projectId);
      res.json(executions);
    } catch (error) {
      console.error('Error fetching executions:', error);
      res.status(500).json({ message: 'Failed to fetch executions' });
    }
  });

  app.post('/api/projects/:projectId/executions', optionalAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const executionData = insertTestExecutionSchema.parse({
        ...req.body,
        projectId,
      });
      
      const execution = await storage.createTestExecution(executionData);
      
      // Start test execution asynchronously
      testExecutor.executeTest(execution.id).catch(error => {
        console.error('Test execution failed:', error);
      });
      
      res.json(execution);
    } catch (error) {
      console.error('Error creating execution:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid execution data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create execution' });
      }
    }
  });

  app.get('/api/executions/:id', optionalAuth, async (req, res) => {
    try {
      const executionId = parseInt(req.params.id);
      const execution = await storage.getTestExecution(executionId);
      
      if (!execution) {
        return res.status(404).json({ message: 'Execution not found' });
      }
      
      res.json(execution);
    } catch (error) {
      console.error('Error fetching execution:', error);
      res.status(500).json({ message: 'Failed to fetch execution' });
    }
  });

  app.get('/api/executions/:id/steps', optionalAuth, async (req, res) => {
    try {
      const executionId = parseInt(req.params.id);
      const steps = await storage.getTestSteps(executionId);
      res.json(steps);
    } catch (error) {
      console.error('Error fetching steps:', error);
      res.status(500).json({ message: 'Failed to fetch steps' });
    }
  });

  // Manual test trigger
  app.post('/api/test/execute', optionalAuth, async (req, res) => {
    try {
      const { projectId, userStory, jiraTicketId } = req.body;
      
      if (!projectId || !userStory) {
        return res.status(400).json({ message: 'Project ID and user story are required' });
      }
      
      const execution = await storage.createTestExecution({
        projectId: parseInt(projectId),
        userStory,
        jiraTicketId: jiraTicketId || null,
        status: 'pending',
      });
      
      // Start test execution asynchronously
      testExecutor.executeTest(execution.id).catch(error => {
        console.error('Test execution failed:', error);
      });
      
      res.json({ success: true, executionId: execution.id });
    } catch (error) {
      console.error('Error starting test execution:', error);
      res.status(500).json({ message: 'Failed to start test execution' });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('WebSocket message received:', data);
        
        // Handle subscription to execution updates
        if (data.type === 'subscribe' && data.executionId) {
          (ws as any).executionId = data.executionId;
          console.log(`Client subscribed to execution ${data.executionId}`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Store WebSocket server for use in test executor
  (testExecutor as any).wss = wss;

  return httpServer;
}
