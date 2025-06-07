/**
 * AI Agent Service - Orchestrates the complete automation workflow
 * Combines Groq LLM and Puppeteer for intelligent test automation
 */

import { groqService } from './groqService';
import { puppeteerService } from './puppeteerService';
import { storage } from '../storage';
import type { TestConfiguration, TestExecution, TestStep } from '@shared/schema';

export interface WorkflowContext {
  testConfigId: number;
  executionId: number;
  currentStepNumber: number;
  sessionId: string;
  completedSteps: string[];
  isAuthenticated: boolean;
}

export interface WorkflowResult {
  success: boolean;
  completedSteps: number;
  failedSteps: number;
  totalSteps: number;
  executionTime: number;
  error?: string;
  finalReport: string;
}

export class AIAgent {
  private activeWorkflows: Map<number, WorkflowContext> = new Map();

  /**
   * Start a complete test automation workflow
   */
  async startAutomationWorkflow(testConfigId: number): Promise<{ executionId: number; sessionId: string }> {
    try {
      console.log(`Starting automation workflow for test config ${testConfigId}`);

      // Get test configuration
      const testConfig = await storage.getTestConfiguration(testConfigId);
      if (!testConfig) {
        throw new Error(`Test configuration ${testConfigId} not found`);
      }

      // Create test execution record
      const execution = await storage.createTestExecution({
        configurationId: testConfigId,
        status: 'running',
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0
      });

      // Generate unique session ID for this workflow
      const sessionId = `session_${execution.id}_${Date.now()}`;

      // Create workflow context
      const context: WorkflowContext = {
        testConfigId,
        executionId: execution.id,
        currentStepNumber: 1,
        sessionId,
        completedSteps: [],
        isAuthenticated: false
      };

      this.activeWorkflows.set(execution.id, context);

      // Start the workflow asynchronously
      this.executeWorkflow(context, testConfig).catch(error => {
        console.error(`Workflow ${execution.id} failed:`, error);
        this.handleWorkflowError(execution.id, error);
      });

      return { executionId: execution.id, sessionId };

    } catch (error) {
      console.error('Failed to start automation workflow:', error);
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute the complete automation workflow
   */
  private async executeWorkflow(context: WorkflowContext, testConfig: TestConfiguration): Promise<void> {
    const startTime = Date.now();
    let totalSteps = 0;
    let completedSteps = 0;
    let failedSteps = 0;

    try {
      console.log(`Executing workflow for execution ${context.executionId}`);

      // Step 1: Scrape the target website
      console.log('Step 1: Scraping target website...');
      const scrapingResult = await puppeteerService.scrapeWebsite(
        testConfig.targetUrl,
        context.sessionId,
        testConfig.credentials as any
      );

      // Store scraped data
      await storage.createScrapedData({
        configurationId: context.testConfigId,
        url: testConfig.targetUrl,
        htmlStructure: scrapingResult.htmlStructure,
        selectors: scrapingResult.selectors,
        pageTitle: scrapingResult.pageTitle,
        formFields: scrapingResult.formFields,
        clickableElements: scrapingResult.clickableElements,
        authenticationDetected: scrapingResult.authenticationDetected
      });

      // Update authentication status
      context.isAuthenticated = !scrapingResult.authenticationDetected;

      // Step 2: Start iterative AI-driven automation
      let isWorkflowComplete = false;
      let currentPageState = scrapingResult.pageState;
      let attemptCount = 0;
      const maxAttempts = 20; // Prevent infinite loops

      while (!isWorkflowComplete && attemptCount < maxAttempts) {
        attemptCount++;
        totalSteps++;

        console.log(`Executing step ${context.currentStepNumber}...`);

        // Generate next automation step using AI
        const aiResponse = await groqService.generateAutomationScript(
          testConfig.userStory,
          {
            selectors: scrapingResult.selectors,
            formFields: scrapingResult.formFields,
            clickableElements: scrapingResult.clickableElements,
            pageTitle: scrapingResult.pageTitle,
            authenticationDetected: scrapingResult.authenticationDetected
          },
          currentPageState,
          context.completedSteps
        );

        // Store AI conversation
        await storage.createAiConversation({
          executionId: context.executionId,
          stepId: null,
          prompt: `Generate automation step ${context.currentStepNumber}`,
          response: JSON.stringify(aiResponse),
          model: 'groq-llm',
          tokensUsed: 0,
          responseTime: 0
        });

        // Create test step record
        const testStep = await storage.createTestStep({
          executionId: context.executionId,
          stepNumber: context.currentStepNumber,
          description: aiResponse.description,
          aiGeneratedScript: aiResponse.script,
          status: 'running'
        });

        // Execute the automation script
        const executionResult = await puppeteerService.executeAutomationScript(
          aiResponse.script,
          context.sessionId,
          testStep.id
        );

        // Update step status
        await storage.updateTestStep(testStep.id, {
          status: executionResult.success ? 'completed' : 'failed',
          completedAt: new Date(),
          result: executionResult,
          errorMessage: executionResult.error,
          screenshot: executionResult.screenshot,
          pageState: executionResult.pageState
        });

        if (executionResult.success) {
          completedSteps++;
          context.completedSteps.push(aiResponse.description);
          
          // Handle navigation if needed
          if (aiResponse.nextAction) {
            console.log(`Navigating to: ${aiResponse.nextAction}`);
            // Re-scrape if navigating to a new page
            if (aiResponse.nextAction !== currentPageState.url) {
              const newScrapingResult = await puppeteerService.scrapeWebsite(
                aiResponse.nextAction,
                context.sessionId
              );
              currentPageState = newScrapingResult.pageState;
            }
          } else {
            currentPageState = executionResult.pageState;
          }

          // Check if workflow is complete
          if (aiResponse.isComplete) {
            isWorkflowComplete = true;
            console.log('AI determined that the workflow is complete');
          }
        } else {
          failedSteps++;
          console.error(`Step ${context.currentStepNumber} failed:`, executionResult.error);

          // Try to generate error recovery
          const recoveryResponse = await groqService.generateErrorRecovery(
            executionResult.error || 'Unknown error',
            aiResponse.script,
            currentPageState
          );

          if (recoveryResponse.shouldRetry) {
            console.log('Attempting error recovery...');
            // Try recovery script
            const recoveryResult = await puppeteerService.executeAutomationScript(
              recoveryResponse.recoveryScript,
              context.sessionId,
              testStep.id
            );

            if (recoveryResult.success) {
              console.log('Error recovery successful');
              await storage.updateTestStep(testStep.id, {
                status: 'completed',
                result: recoveryResult,
                errorMessage: null
              });
              completedSteps++;
              failedSteps--;
            } else {
              console.log('Error recovery failed, continuing...');
            }
          }
        }

        context.currentStepNumber++;
      }

      // Update final execution status
      const executionTime = Date.now() - startTime;
      const finalStatus = failedSteps === 0 ? 'completed' : 'failed';
      
      await storage.updateTestExecution(context.executionId, {
        status: finalStatus,
        completedAt: new Date(),
        totalSteps,
        completedSteps,
        failedSteps,
        results: {
          success: failedSteps === 0,
          totalSteps,
          completedSteps,
          failedSteps,
          executionTime,
          isWorkflowComplete
        }
      });

      console.log(`Workflow completed: ${completedSteps}/${totalSteps} steps successful`);

    } catch (error) {
      console.error('Workflow execution failed:', error);
      await this.handleWorkflowError(context.executionId, error);
    } finally {
      // Clean up
      this.activeWorkflows.delete(context.executionId);
      await puppeteerService.closePage(context.sessionId);
    }
  }

  /**
   * Handle workflow errors
   */
  private async handleWorkflowError(executionId: number, error: any): Promise<void> {
    try {
      await storage.updateTestExecution(executionId, {
        status: 'failed',
        completedAt: new Date(),
        errorLog: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (updateError) {
      console.error('Failed to update execution with error:', updateError);
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(executionId: number): Promise<{
    execution: any;
    steps: any[];
    isActive: boolean;
  }> {
    const execution = await storage.getTestExecution(executionId);
    const steps = await storage.getTestStepsByExecution(executionId);
    const isActive = this.activeWorkflows.has(executionId);

    return {
      execution,
      steps,
      isActive
    };
  }

  /**
   * Stop a running workflow
   */
  async stopWorkflow(executionId: number): Promise<void> {
    const context = this.activeWorkflows.get(executionId);
    if (context) {
      try {
        await puppeteerService.closePage(context.sessionId);
        await storage.updateTestExecution(executionId, {
          status: 'failed',
          completedAt: new Date(),
          errorLog: 'Workflow stopped by user'
        });
        this.activeWorkflows.delete(executionId);
      } catch (error) {
        console.error('Error stopping workflow:', error);
      }
    }
  }

  /**
   * Generate comprehensive test report
   */
  async generateTestReport(executionId: number): Promise<{
    summary: any;
    stepDetails: any[];
    recommendations: string[];
    screenshots: string[];
  }> {
    const execution = await storage.getTestExecution(executionId);
    const steps = await storage.getTestStepsByExecution(executionId);
    const conversations = await storage.getAiConversationsByExecution(executionId);

    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    // Generate summary
    const summary = {
      executionId,
      status: execution.status,
      totalSteps: steps.length,
      completedSteps: steps.filter(s => s.status === 'completed').length,
      failedSteps: steps.filter(s => s.status === 'failed').length,
      executionTime: execution.completedAt && execution.startedAt 
        ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
        : 0,
      successRate: steps.length > 0 
        ? Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)
        : 0
    };

    // Collect step details
    const stepDetails = steps.map(step => ({
      stepNumber: step.stepNumber,
      description: step.description,
      status: step.status,
      executionTime: step.completedAt && step.startedAt
        ? new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()
        : 0,
      error: step.errorMessage,
      screenshot: step.screenshot
    }));

    // Collect screenshots
    const screenshots = steps
      .filter(step => step.screenshot)
      .map(step => step.screenshot!);

    // Generate recommendations (simplified)
    const recommendations = [];
    if (summary.failedSteps > 0) {
      recommendations.push('Consider reviewing failed steps and updating selectors');
    }
    if (summary.successRate < 80) {
      recommendations.push('Test reliability could be improved with better element selection');
    }
    if (summary.executionTime > 60000) {
      recommendations.push('Consider optimizing test steps for faster execution');
    }

    return {
      summary,
      stepDetails,
      recommendations,
      screenshots
    };
  }

  /**
   * Get active workflows count
   */
  getActiveWorkflowsCount(): number {
    return this.activeWorkflows.size;
  }

  /**
   * List all active workflows
   */
  getActiveWorkflows(): number[] {
    return Array.from(this.activeWorkflows.keys());
  }
}

export const aiAgent = new AIAgent();
