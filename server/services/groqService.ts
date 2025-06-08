import { z } from 'zod';

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'CHANGE_ME_GROQ_API_KEY';
const MODEL = 'deepseek-r1-distill-llama-70b'; // Using a more stable model

// Response schemas for validation
const AutomationStepSchema = z.object({
  action: z.string(),
  selector: z.string().optional(),
  value: z.string().optional(),
  description: z.string(),
  code: z.string(),
});

const GroqResponseSchema = z.object({
  steps: z.array(AutomationStepSchema),
  reasoning: z.string(),
  nextAction: z.string().optional(),
});

export interface AutomationStep {
  action: string;
  selector?: string;
  value?: string;
  description: string;
  code: string;
}

export interface GroqAnalysisResult {
  steps: AutomationStep[];
  reasoning: string;
  nextAction?: string;
}

// below 2 added myself 
export interface AutomationScript {
  description: string;
  script: string;
  nextAction?: string;
  isComplete: boolean;
}

export interface ErrorRecovery {
  shouldRetry: boolean;
  recoveryScript: string;
}

export class GroqService {
  private async makeApiCall(messages: any[]): Promise<any> {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.1, // Low temperature for consistent results
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from Groq API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  async analyzeUserStoryAndGenerateSteps(
    userStory: string,
    htmlContent: string,
    availableSelectors: Record<string, string[]>,
    currentUrl: string,
    isAuthenticated: boolean = false
  ): Promise<GroqAnalysisResult> {
    const systemPrompt = `You are an expert automation testing engineer. Your job is to analyze user stories and generate precise Puppeteer automation steps.

IMPORTANT RULES:
1. Generate practical, executable Puppeteer code
2. Use only selectors that exist in the provided HTML
3. Handle authentication flows if required
4. Include proper error handling and waits
5. Generate steps that can be executed sequentially
6. Focus on the specific user story requirements

Your response must be valid JSON in this exact format:
{
  "steps": [
    {
      "action": "click|type|navigate|wait|screenshot",
      "selector": "css_selector_here",
      "value": "text_to_type",
      "description": "What this step does",
      "code": "const element = await page.waitForSelector('selector'); await element.click();"
    }
  ],
  "reasoning": "Why these steps achieve the user story",
  "nextAction": "What should happen next (optional)"
}`;

    const userPrompt = `Analyze this user story and generate automation steps:

USER STORY: ${userStory}

CURRENT PAGE URL: ${currentUrl}
IS AUTHENTICATED: ${isAuthenticated}

AVAILABLE SELECTORS:
${JSON.stringify(availableSelectors, null, 2)}

HTML CONTENT (truncated):
${htmlContent.substring(0, 3000)}...

Generate the minimal set of automation steps needed to complete this user story. Each step should be a valid Puppeteer action with proper error handling.`;

    try {
      const responseContent = await this.makeApiCall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Sometimes the LLM wraps JSON in markdown code blocks
        const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : responseContent;
        parsedResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Failed to parse Groq response as JSON:', responseContent);
        // Fallback: create a simple step if parsing fails
        parsedResponse = {
          steps: [{
            action: 'screenshot',
            description: 'Take screenshot of current page',
            code: 'await page.screenshot({ path: `screenshot-${Date.now()}.png`, fullPage: true });'
          }],
          reasoning: 'Failed to parse AI response, taking screenshot as fallback',
          nextAction: 'Manual intervention required'
        };
      }

      // Validate the response structure
      const validated = GroqResponseSchema.parse(parsedResponse);
      return validated;
    } catch (error) {
      console.error('Error in analyzeUserStoryAndGenerateSteps:', error);
      throw new Error(`Failed to analyze user story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateNextStep(
    currentContext: {
      userStory: string;
      completedSteps: string[];
      currentUrl: string;
      htmlContent: string;
      availableSelectors: Record<string, string[]>;
      lastError?: string;
    }
  ): Promise<GroqAnalysisResult> {
    const systemPrompt = `You are continuing an automation test. Analyze the current state and determine the next step to complete the user story.

IMPORTANT: 
- Consider what has already been completed
- Adapt to any errors that occurred
- Focus on progressing toward the user story goal
- Generate only ONE next step

Your response must be valid JSON in the same format as before.`;

    const userPrompt = `Continue automation for this user story:

USER STORY: ${currentContext.userStory}

COMPLETED STEPS:
${currentContext.completedSteps.join('\n')}

CURRENT URL: ${currentContext.currentUrl}
${currentContext.lastError ? `LAST ERROR: ${currentContext.lastError}` : ''}

CURRENT PAGE SELECTORS:
${JSON.stringify(currentContext.availableSelectors, null, 2)}

CURRENT HTML (truncated):
${currentContext.htmlContent.substring(0, 2000)}...

What is the next step to continue toward completing the user story?`;

    try {
      const responseContent = await this.makeApiCall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Parse and validate response
      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : responseContent;
      const parsedResponse = JSON.parse(jsonContent);
      
      return GroqResponseSchema.parse(parsedResponse);
    } catch (error) {
      console.error('Error in generateNextStep:', error);
      throw new Error(`Failed to generate next step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

//   async validateTestCompletion(
//     userStory: string,
//     executedSteps: string[],
//     finalState: string
//   ): Promise<{ isComplete: boolean; reason: string; confidence: number }> {
//     const systemPrompt = `You are validating whether an automation test has successfully completed its user story. Analyze the executed steps and final state to determine completion.

// Return JSON in this format:
// {
//   "isComplete": true/false,
//   "reason": "Explanation of why the test is complete or what is missing",
//   "confidence": 0-100 (percentage confidence in your assessment)
// }`;

//     const userPrompt = `Validate test completion:

// USER STORY: ${userStory}

// EXECUTED STEPS:
// ${executedSteps.join('\n')}

// FINAL STATE: ${finalState}

// Has the user story been successfully completed?`;

//     try {
//       const responseContent = await this.makeApiCall([
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt }
//       ]);

//       const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//       const jsonContent = jsonMatch ? jsonMatch[1] : responseContent;
//       return JSON.parse(jsonContent);
//     } catch (error) {
//       console.error('Error in validateTestCompletion:', error);
//       return {
//         isComplete: false,
//         reason: 'Failed to validate completion due to AI service error',
//         confidence: 0
//       };
//     }
//   }
// }

// export const groqService = new GroqService();




async generateAutomationScript(
    userStory: string,
    pageInfo: {
      selectors: Record<string, string[]>;
      pageTitle: string;
      isAuthRequired: boolean;
    },
    currentPageState: {
      url: string;
      title: string;
      html: string;
    },
    completedSteps: string[]
  ): Promise<AutomationScript> {
    const systemPrompt = `You are an expert web automation engineer. Generate a Puppeteer automation script based on the user story and current page state.

Return JSON in this format:
{
  "description": "Human readable description of the step",
  "script": "Puppeteer automation script",
  "nextAction": "Optional URL to navigate to",
  "isComplete": true/false
}

IMPORTANT:
1. Generate valid Puppeteer code
2. Include proper error handling
3. Add appropriate waits
4. Handle navigation if needed
5. Validate success conditions`;

    const userPrompt = `Generate automation step:

USER STORY: ${userStory}

CURRENT PAGE:
URL: ${currentPageState.url}
Title: ${currentPageState.title}

AVAILABLE SELECTORS:
${JSON.stringify(pageInfo.selectors, null, 2)}

AUTH REQUIRED: ${pageInfo.isAuthRequired}

COMPLETED STEPS:
${completedSteps.join('\n')}

Generate the next automation step.`;

    try {
      const responseContent = await this.makeApiCall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : responseContent;
      
      const parsedResponse = JSON.parse(jsonContent);
      
      // Validate the response structure
      if (!parsedResponse.description || !parsedResponse.script) {
        throw new Error('Invalid response format: missing required fields');
      }

      return {
        description: parsedResponse.description,
        script: parsedResponse.script,
        nextAction: parsedResponse.nextAction,
        isComplete: parsedResponse.isComplete || false
      };
    } catch (error) {
      console.error('Error in generateAutomationScript:', error);
      throw new Error(`Failed to generate automation script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateErrorRecovery(
    error: string,
    failedScript: string,
    currentPageState: {
      url: string;
      title: string;
      html: string;
    }
  ): Promise<ErrorRecovery> {
    const systemPrompt = `You are an expert web automation engineer. Generate a recovery script for a failed automation step.

Return JSON in this format:
{
  "shouldRetry": true/false,
  "recoveryScript": "Puppeteer recovery script"
}

IMPORTANT:
1. Analyze the error carefully
2. Generate a safe recovery script
3. Include proper error handling
4. Add appropriate waits
5. Validate recovery success`;

    const userPrompt = `Generate error recovery:

ERROR: ${error}

FAILED SCRIPT:
${failedScript}

CURRENT PAGE:
URL: ${currentPageState.url}
Title: ${currentPageState.title}

Generate a recovery script if possible.`;

    try {
      const responseContent = await this.makeApiCall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : responseContent;
      
      const parsedResponse = JSON.parse(jsonContent);
      
      // Validate the response structure
      if (typeof parsedResponse.shouldRetry !== 'boolean' || !parsedResponse.recoveryScript) {
        throw new Error('Invalid response format: missing required fields');
      }

      return {
        shouldRetry: parsedResponse.shouldRetry,
        recoveryScript: parsedResponse.recoveryScript
      };
    } catch (error) {
      console.error('Error in generateErrorRecovery:', error);
      return {
        shouldRetry: false,
        recoveryScript: ''
      };
    }
  }

  async validateTestCompletion(
    userStory: string,
    executedSteps: string[],
    finalState: string
  ): Promise<{ isComplete: boolean; reason: string; confidence: number }> {
    const systemPrompt = `You are validating whether an automation test has successfully completed its user story. Analyze the executed steps and final state to determine completion.

Return JSON in this format:
{
  "isComplete": true/false,
  "reason": "Explanation of why the test is complete or what is missing",
  "confidence": 0-100 (percentage confidence in your assessment)
}

IMPORTANT:
1. Carefully analyze the user story
2. Check all required steps were executed
3. Validate the final state
4. Consider edge cases
5. Provide clear reasoning`;

    const userPrompt = `Validate test completion:

USER STORY: ${userStory}

EXECUTED STEPS:
${executedSteps.join('\n')}

FINAL STATE: ${finalState}

Has the user story been successfully completed?`;

    try {
      const responseContent = await this.makeApiCall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : responseContent;
      
      const parsedResponse = JSON.parse(jsonContent);
      
      // Validate the response structure
      if (typeof parsedResponse.isComplete !== 'boolean' || !parsedResponse.reason || typeof parsedResponse.confidence !== 'number') {
        throw new Error('Invalid response format: missing required fields');
      }

      return {
        isComplete: parsedResponse.isComplete,
        reason: parsedResponse.reason,
        confidence: Math.min(Math.max(parsedResponse.confidence, 0), 100)
      };
    } catch (error) {
      console.error('Error in validateTestCompletion:', error);
      return {
        isComplete: false,
        reason: 'Failed to validate completion due to AI service error',
        confidence: 0
      };
    }
  }
}

export const groqService = new GroqService();
