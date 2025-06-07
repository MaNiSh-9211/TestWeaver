import { storage } from '../storage';
import { puppeteerService } from './puppeteerService';
import { groqService } from './groqService';
import type { TestExecution, TestProject } from '@shared/schema';
import { WebSocketServer, WebSocket } from 'ws';

export class TestExecutor {
  private activeExecutions: Map<number, boolean> = new Map();
  public wss?: WebSocketServer; // Set by routes.ts

  async executeTest(executionId: number): Promise<void> {
    // Prevent duplicate executions
    if (this.activeExecutions.get(executionId)) {
      console.log(`Test execution ${executionId} is already running`);
      return;
    }

    this.activeExecutions.set(executionId, true);

    try {
      console.log(`Starting test execution ${executionId}`);
      
      // Get execution details
      const execution = await storage.getTestExecution(executionId);
      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      // Get project details
      const project = await storage.getTestProject(execution.projectId);
      if (!project) {
        throw new Error(`Project ${execution.projectId} not found`);
      }

      // Update execution status
      await storage.updateTestExecution(executionId, {
        status: 'running',
        startedAt: new Date(),
      });

      this.broadcastUpdate(executionId, {
        type: 'execution_started',
        executionId,
        status: 'running'
      });

      // Initialize Puppeteer
      await puppeteerService.initialize();

      try {
        // Step 1: Scrape the website
        await this.createTestStep(executionId, 1, 'Scraping target website', 'running');
        
        const scrapingResult = await puppeteerService.scrapeWebsite(
          project.baseUrl,
          project.authCredentials as any
        );

        await this.updateTestStep(executionId, 1, {
          status: 'completed',
          pageUrl: scrapingResult.url,
          extractedSelectors: Object.keys(scrapingResult.selectors),
          screenshotPath: scrapingResult.screenshots[0] || null,
        });

        this.broadcastUpdate(executionId, {
          type: 'step_completed',
          executionId,
          stepNumber: 1,
          status: 'completed'
        });

        // Step 2: Analyze with AI and generate automation steps
        await this.createTestStep(executionId, 2, 'Analyzing user story with AI', 'running');

        const aiAnalysis = await groqService.analyzeUserStoryAndGenerateSteps(
          execution.userStory,
          scrapingResult.htmlContent,
          scrapingResult.selectors,
          scrapingResult.url,
          project.authRequired || false
        );

        await this.updateTestStep(executionId, 2, {
          status: 'completed',
          aiGeneratedScript: JSON.stringify(aiAnalysis, null, 2),
        });

        this.broadcastUpdate(executionId, {
          type: 'step_completed',
          executionId,
          stepNumber: 2,
          status: 'completed',
          aiAnalysis
        });

        // Execute automation steps
        let stepNumber = 3;
        const executedSteps: string[] = [];

        for (const automationStep of aiAnalysis.steps) {
          await this.createTestStep(
            executionId, 
            stepNumber, 
            automationStep.description, 
            'running'
          );

          this.broadcastUpdate(executionId, {
            type: 'step_started',
            executionId,
            stepNumber,
            description: automationStep.description
          });

          try {
            const startTime = Date.now();
            
            // Execute the automation step
            const result = await puppeteerService.executeAutomationScript(automationStep.code);
            
            const executionTime = Date.now() - startTime;

            if (result.success) {
              // Take screenshot after successful step
              const screenshotPath = await puppeteerService.takeScreenshot(
                `execution-${executionId}-step-${stepNumber}.png`
              );

              await this.updateTestStep(executionId, stepNumber, {
                status: 'completed',
                executionTime,
                screenshotPath,
                aiGeneratedScript: automationStep.code,
              });

              executedSteps.push(`Step ${stepNumber}: ${automationStep.description} - SUCCESS`);

              this.broadcastUpdate(executionId, {
                type: 'step_completed',
                executionId,
                stepNumber,
                status: 'completed',
                executionTime
              });

              // Wait a moment between steps
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error(result.error || 'Automation step failed');
            }
          } catch (stepError) {
            const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown error';
            
            await this.updateTestStep(executionId, stepNumber, {
              status: 'failed',
              errorMessage,
              aiGeneratedScript: automationStep.code,
            });

            executedSteps.push(`Step ${stepNumber}: ${automationStep.description} - FAILED: ${errorMessage}`);

            this.broadcastUpdate(executionId, {
              type: 'step_failed',
              executionId,
              stepNumber,
              status: 'failed',
              error: errorMessage
            });

            console.error(`Step ${stepNumber} failed:`, stepError);
            
            // Try to continue with next steps or fail completely
            // For now, we'll continue to see if subsequent steps can succeed
          }

          stepNumber++;
        }

        // Final validation
        const currentPageInfo = await puppeteerService.getCurrentPageInfo();
        const validation = await groqService.validateTestCompletion(
          execution.userStory,
          executedSteps,
          `Current URL: ${currentPageInfo.url}, Title: ${currentPageInfo.title}`
        );

        // Update execution as completed
        await storage.updateTestExecution(executionId, {
          status: validation.isComplete ? 'completed' : 'failed',
          completedAt: new Date(),
          totalSteps: stepNumber - 1,
          completedSteps: stepNumber - 1,
          errorMessage: validation.isComplete ? null : validation.reason,
        });

        this.broadcastUpdate(executionId, {
          type: 'execution_completed',
          executionId,
          status: validation.isComplete ? 'completed' : 'failed',
          validation
        });

        console.log(`Test execution ${executionId} completed with status: ${validation.isComplete ? 'success' : 'failed'}`);

      } finally {
        // Clean up Puppeteer
        await puppeteerService.cleanup();
      }

    } catch (error) {
      console.error(`Test execution ${executionId} failed:`, error);
      
      // Update execution as failed
      await storage.updateTestExecution(executionId, {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      this.broadcastUpdate(executionId, {
        type: 'execution_failed',
        executionId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Clean up Puppeteer on error
      await puppeteerService.cleanup().catch(console.error);
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  private async createTestStep(
    executionId: number,
    stepNumber: number,
    description: string,
    status: string
  ) {
    return storage.createTestStep({
      executionId,
      stepNumber,
      description,
      status,
    });
  }

  private async updateTestStep(
    executionId: number,
    stepNumber: number,
    updates: any
  ) {
    const steps = await storage.getTestSteps(executionId);
    const step = steps.find(s => s.stepNumber === stepNumber);
    
    if (step) {
      return storage.updateTestStep(step.id, updates);
    }
  }

  private broadcastUpdate(executionId: number, data: any) {
    if (!this.wss) return;

    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN && (client as any).executionId === executionId) {
        client.send(JSON.stringify(data));
      }
    });
  }

  async getExecutionStatus(executionId: number) {
    const execution = await storage.getTestExecution(executionId);
    const steps = await storage.getTestSteps(executionId);
    
    return {
      execution,
      steps,
      isRunning: this.activeExecutions.has(executionId),
    };
  }
}

export const testExecutor = new TestExecutor();
