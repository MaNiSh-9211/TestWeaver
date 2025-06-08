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
  // async startAutomationWorkflow(testConfigId: number): Promise<{ executionId: number; sessionId: string }> {
  //   try {
  //     console.log(`Starting automation workflow for test config ${testConfigId}`);

  //     // Get test configuration
  //     const testConfig = await storage.getTestConfiguration(testConfigId);
  //     if (!testConfig) {
  //       throw new Error(`Test configuration ${testConfigId} not found`);
  //     }

  //     // Create test execution record
  //     const execution = await storage.createTestExecution({
  //       projectId: testConfigId,
  //       userStory: '', // or some meaningful value
  //       status: 'running',
  //       startedAt: new Date(),
  //       totalSteps: 0,
  //       completedSteps: 0,
  //       failedSteps: 0
  //     });

  //     // Generate unique session ID for this workflow
  //     const sessionId = `session_${execution.id}_${Date.now()}`;

  //     // Create workflow context
  //     const context: WorkflowContext = {
  //       testConfigId,
  //       executionId: execution.id,
  //       currentStepNumber: 1,
  //       sessionId,
  //       completedSteps: [],
  //       isAuthenticated: false
  //     };

  //     this.activeWorkflows.set(execution.id, context);

  //     // Start the workflow asynchronously
  //     this.executeWorkflow(context, testConfig).catch(error => {
  //       console.error(`Workflow ${execution.id} failed:`, error);
  //       this.handleWorkflowError(execution.id, error);
  //     });

  //     return { executionId: execution.id, sessionId };

  //   } catch (error) {
  //     console.error('Failed to start automation workflow:', error);
  //     throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // }




  
  async startAutomationWorkflow(projectId: number, userStory: string): Promise<TestExecution> {
    try {
      // Create test execution record
      const execution = await storage.createTestExecution({
        projectId,
        userStory,
        status: 'running',
        startedAt: new Date(),
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0
      });

      // Initialize browser and page
      await puppeteerService.initialize();

      try {
        // Start URL scraping
        const config = await storage.getTestConfiguration(projectId);
        if (!config) {
          throw new Error(`Test configuration for project ${projectId} not found`);
        }

        // Scrape the website
        const scrapingResult = await puppeteerService.scrapeWebsite(config.targetUrl);
        
        // Store scraped data
        await storage.createScrapedPage({
          projectId,
          url: scrapingResult.url,
          htmlContent: scrapingResult.htmlContent,
          extractedSelectors: scrapingResult.selectors,
          isAuthRequired: scrapingResult.isAuthRequired,
          screenshots: scrapingResult.screenshots,
          lastScrapedAt: new Date()
        });

        // Execute workflow
        await this.executeWorkflow(execution, userStory, scrapingResult);

        // Final validation
        const finalState = await puppeteerService.getCurrentPageInfo();

        const steps = await storage.getTestSteps(execution.id);
        const validation = await groqService.validateTestCompletion(
          userStory,
          steps.map(s => s.description),
          JSON.stringify(finalState)
        );

        // Update execution status
        const updatedExecution = await storage.updateTestExecution(execution.id, {
          status: validation.isComplete ? 'completed' : 'failed',
          completedAt: new Date(),
          reportData: {
            finalState,
            validationResult: validation
          } as Record<string, any>
        });

        if (!updatedExecution) {
          throw new Error('Failed to update test execution');
        }

        return updatedExecution;
      } finally {
        await puppeteerService.cleanup();
      }
    } catch (error) {
      console.error('Error in automation workflow:', error);
      throw new Error(`Automation workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Execute the complete automation workflow
   */
  // private async executeWorkflow(context: WorkflowContext, testConfig: TestConfiguration): Promise<void> {
  //   const startTime = Date.now();
  //   let totalSteps = 0;
  //   let completedSteps = 0;
  //   let failedSteps = 0;

  //   try {
  //     console.log(`Executing workflow for execution ${context.executionId}`);

  //     // Step 1: Scrape the target website
  //     console.log('Step 1: Scraping target website...');
  //     const scrapingResult = await puppeteerService.scrapeWebsite(
  //       testConfig.targetUrl,
  //       context.sessionId,
  //       testConfig.credentials as any
  //     );

  //     // Store scraped data
  //     await storage.createScrapedData({
  //       configurationId: context.testConfigId,
  //       url: testConfig.targetUrl,
  //       htmlStructure: scrapingResult.htmlStructure,
  //       selectors: scrapingResult.selectors,
  //       pageTitle: scrapingResult.pageTitle,
  //       formFields: scrapingResult.formFields,
  //       clickableElements: scrapingResult.clickableElements,
  //       authenticationDetected: scrapingResult.authenticationDetected
  //     });

  //     // Update authentication status
  //     context.isAuthenticated = !scrapingResult.authenticationDetected;

  //     // Step 2: Start iterative AI-driven automation
  //     let isWorkflowComplete = false;
  //     let currentPageState = scrapingResult.pageState;
  //     let attemptCount = 0;
  //     const maxAttempts = 20; // Prevent infinite loops

  //     while (!isWorkflowComplete && attemptCount < maxAttempts) {
  //       attemptCount++;
  //       totalSteps++;

  //       console.log(`Executing step ${context.currentStepNumber}...`);

  //       // Generate next automation step using AI
  //       const aiResponse = await groqService.generateAutomationScript(
  //         testConfig.userStory,
  //         {
  //           selectors: scrapingResult.selectors,
  //           formFields: scrapingResult.formFields,
  //           clickableElements: scrapingResult.clickableElements,
  //           pageTitle: scrapingResult.pageTitle,
  //           authenticationDetected: scrapingResult.authenticationDetected
  //         },
  //         currentPageState,
  //         context.completedSteps
  //       );

  //       // Store AI conversation
  //       await storage.createAiConversation({
  //         executionId: context.executionId,
  //         stepId: null,
  //         prompt: `Generate automation step ${context.currentStepNumber}`,
  //         response: JSON.stringify(aiResponse),
  //         model: 'groq-llm',
  //         tokensUsed: 0,
  //         responseTime: 0
  //       });

  //       // Create test step record
  //       const testStep = await storage.createTestStep({
  //         executionId: context.executionId,
  //         stepNumber: context.currentStepNumber,
  //         description: aiResponse.description,
  //         aiGeneratedScript: aiResponse.script,
  //         status: 'running'
  //       });

  //       // Execute the automation script
  //       const executionResult = await puppeteerService.executeAutomationScript(
  //         aiResponse.script,
  //         // context.sessionId,
  //         // testStep.id
  //       );

  //       // Update step status
  //       await storage.updateTestStep(testStep.id, {
  //         status: executionResult.success ? 'completed' : 'failed',
  //         completedAt: new Date(),
  //         result: executionResult,
  //         errorMessage: executionResult.error,
  //         screenshot: executionResult.screenshot,
  //         pageState: executionResult.pageState
  //       });

  //       if (executionResult.success) {
  //         completedSteps++;
  //         context.completedSteps.push(aiResponse.description);
          
  //         // Handle navigation if needed
  //         if (aiResponse.nextAction) {
  //           console.log(`Navigating to: ${aiResponse.nextAction}`);
  //           // Re-scrape if navigating to a new page
  //           if (aiResponse.nextAction !== currentPageState.url) {
  //             const newScrapingResult = await puppeteerService.scrapeWebsite(
  //               aiResponse.nextAction,
  //               context.sessionId
  //             );
  //             currentPageState = newScrapingResult.pageState;
  //           }
  //         } else {
  //           currentPageState = executionResult.pageState;
  //         }

  //         // Check if workflow is complete
  //         if (aiResponse.isComplete) {
  //           isWorkflowComplete = true;
  //           console.log('AI determined that the workflow is complete');
  //         }
  //       } else {
  //         failedSteps++;
  //         console.error(`Step ${context.currentStepNumber} failed:`, executionResult.error);

  //         // Try to generate error recovery
  //         const recoveryResponse = await groqService.generateErrorRecovery(
  //           executionResult.error || 'Unknown error',
  //           aiResponse.script,
  //           currentPageState
  //         );

  //         if (recoveryResponse.shouldRetry) {
  //           console.log('Attempting error recovery...');
  //           // Try recovery script
  //           const recoveryResult = await puppeteerService.executeAutomationScript(
  //             recoveryResponse.recoveryScript,
  //             // context.sessionId,
  //             // testStep.id
  //           );

  //           if (recoveryResult.success) {
  //             console.log('Error recovery successful');
  //             await storage.updateTestStep(testStep.id, {
  //               status: 'completed',
  //               result: recoveryResult,
  //               errorMessage: null
  //             });
  //             completedSteps++;
  //             failedSteps--;
  //           } else {
  //             console.log('Error recovery failed, continuing...');
  //           }
  //         }
  //       }

  //       context.currentStepNumber++;
  //     }

  //     // Update final execution status
  //     const executionTime = Date.now() - startTime;
  //     const finalStatus = failedSteps === 0 ? 'completed' : 'failed';
      
  //     await storage.updateTestExecution(context.executionId, {
  //       status: finalStatus,
  //       completedAt: new Date(),
  //       totalSteps,
  //       completedSteps,
  //       failedSteps,
  //       results: {
  //         success: failedSteps === 0,
  //         totalSteps,
  //         completedSteps,
  //         failedSteps,
  //         executionTime,
  //         isWorkflowComplete
  //       }
  //     });

  //     console.log(`Workflow completed: ${completedSteps}/${totalSteps} steps successful`);

  //   } catch (error) {
  //     console.error('Workflow execution failed:', error);
  //     await this.handleWorkflowError(context.executionId, error);
  //   } finally {
  //     // Clean up
  //     this.activeWorkflows.delete(context.executionId);
  //     // await puppeteerService.closePage(context.sessionId);
  //        await puppeteerService.cleanup();

  //   }
  // }





 private async executeWorkflow(
    execution: TestExecution, 
    userStory: string,
    initialScrapingResult: { url: string; title: string; htmlContent: string; selectors: Record<string, string[]>; }
  ): Promise<void> {
    let currentStep = 1;
    const maxSteps = 50; // Prevent infinite loops

    while (currentStep <= maxSteps) {
      try {
        // Get current page state
        const pageState = await puppeteerService.getCurrentPageInfo();

        // Generate next automation step
        const script = await groqService.generateAutomationScript(
          userStory,
          { 
            selectors: initialScrapingResult.selectors, 
            pageTitle: pageState.title, 
            isAuthRequired: false 
          },
          pageState,
          await storage.getTestSteps(execution.id).then(steps => steps.map(s => s.description))
        );

        // Create test step record
        const step = await storage.createTestStep({
          executionId: execution.id,
          stepNumber: currentStep,
          description: script.description,
          status: 'running',
          aiGeneratedScript: script.script
        });

        try {
          // Execute the automation script
          const result = await puppeteerService.executeAutomationScript(script.script);

          // Update step with result
          await storage.updateTestStep(step.id, {
            status: result.success ? 'completed' : 'failed',
            errorMessage: result.error,
            screenshotPath: result.screenshot,
            pageUrl: pageState.url,
            executionTime: Date.now() - step.createdAt!.getTime()
          });

          if (!result.success) {
            // Attempt error recovery
            const recovery = await groqService.generateErrorRecovery(
              result.error || 'Unknown error',
              script.script,
              pageState
            );

            if (recovery.shouldRetry && recovery.recoveryScript) {
              const recoveryResult = await puppeteerService.executeAutomationScript(recovery.recoveryScript);
              
              if (recoveryResult.success) {
                await storage.updateTestStep(step.id, {
                  status: 'completed',
                  errorMessage: `Recovered from error: ${result.error}`,
                  screenshotPath: recoveryResult.screenshot,
                  pageUrl: pageState.url,
                  executionTime: Date.now() - step.createdAt!.getTime()
                });
              }
            }
          }

          // Update execution progress
          await storage.updateTestExecution(execution.id, {
            totalSteps: currentStep,
            completedSteps: currentStep,
            failedSteps: step.status === 'failed' ? 1 : 0
          });

          // Check if workflow is complete
          if (script.isComplete) {
            break;
          }

          // Handle navigation if needed
          if (script.nextAction) {
            await puppeteerService.scrapeWebsite(script.nextAction);
          }

          currentStep++;
        } catch (error) {
          console.error('Error executing step:', error);
          await storage.updateTestStep(step.id, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            pageUrl: pageState.url,
            executionTime: Date.now() - step.createdAt!.getTime()
          });
          throw error;
        }
      } catch (error) {
        console.error('Error in workflow execution:', error);
        await storage.updateTestExecution(execution.id, {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    }

    if (currentStep > maxSteps) {
      throw new Error('Maximum step limit reached');
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
        // errorLog: error instanceof Error ? error.message : 'Unknown error'
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
    // const steps = await storage.getTestStepsByExecution(executionId);
    const steps = await storage.getTestSteps(executionId); // added myself

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
        // await puppeteerService.closePage(context.sessionId); added myself
        await puppeteerService.cleanup();

        await storage.updateTestExecution(executionId, {
          status: 'failed',
          completedAt: new Date(),
          // errorLog: 'Workflow stopped by user'
          errorMessage: 'Workflow stopped by user' // added myself

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
  // async generateTestReport(executionId: number): Promise<{
  //   summary: any;
  //   stepDetails: any[];
  //   recommendations: string[];
  //   screenshots: string[];
  // }> {
  //   const execution = await storage.getTestExecution(executionId);

  //   // const steps = await storage.getTestStepsByExecution(executionId);
  //   const steps = await storage.getTestSteps(executionId);// added myself

  //   const conversations = await storage.getAiConversationsByExecution(executionId);

  //   if (!execution) {
  //     throw new Error(`Execution ${executionId} not found`);
  //   }

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
    const steps = await storage.getTestSteps(executionId);
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
    // const stepDetails = steps.map(step => ({
    //   stepNumber: step.stepNumber,
    //   description: step.description,
    //   status: step.status,
    //   executionTime: step.completedAt && step.startedAt
    //     ? new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()
    //     : 0,
    //   error: step.errorMessage,
    //   screenshot: step.screenshot
    // }));

    // Collect step details
    const stepDetails = steps.map(step => ({
      stepNumber: step.stepNumber,
      description: step.description,
      status: step.status,
      executionTime: step.executionTime,
      error: step.errorMessage,
      screenshot: step.screenshotPath
    }));

    // Collect screenshots
    // const screenshots = steps
    //   .filter(step => step.screenshot)
    //   .map(step => step.screenshot!);

    const screenshots = steps
      .filter(step => step.screenshotPath)
      .map(step => step.screenshotPath!);


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
