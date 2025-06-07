import puppeteer, { Browser, Page } from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface SelectorInfo {
  type: string;
  selector: string;
  text?: string;
  attributes?: Record<string, string>;
}

export interface ScrapingResult {
  url: string;
  title: string;
  htmlContent: string;
  selectors: Record<string, string[]>;
  isAuthRequired: boolean;
  screenshots: string[];
}

export class PuppeteerService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      console.log('Puppeteer browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Puppeteer:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log('Puppeteer browser cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async scrapeWebsite(
    url: string, 
    authCredentials?: { username: string; password: string; type: 'basic' | 'oauth' }
  ): Promise<ScrapingResult> {
    if (!this.page) {
      throw new Error('Puppeteer not initialized');
    }

    try {
      console.log(`Scraping website: ${url}`);
      
      // Navigate to the page
      await this.page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for the page to load completely
      await this.page.waitForTimeout(2000);

      // Check if authentication is required
      const isAuthRequired = await this.detectAuthRequirement();
      
      // Handle authentication if needed and credentials provided
      if (isAuthRequired && authCredentials) {
        await this.handleAuthentication(authCredentials);
        // Wait after authentication
        await this.page.waitForTimeout(3000);
      }

      // Get page info
      const title = await this.page.title();
      const htmlContent = await this.page.content();

      // Extract selectors
      const selectors = await this.extractSelectors();

      // Take screenshot
      const screenshots = await this.takeScreenshots();

      return {
        url: this.page.url(), // Use current URL in case of redirects
        title,
        htmlContent,
        selectors,
        isAuthRequired,
        screenshots,
      };
    } catch (error) {
      console.error(`Error scraping website ${url}:`, error);
      throw error;
    }
  }

  private async detectAuthRequirement(): Promise<boolean> {
    if (!this.page) return false;

    try {
      // Check for common authentication indicators
      const authIndicators = await this.page.evaluate(() => {
        const indicators = [
          'input[type="password"]',
          'form[action*="login"]',
          'form[action*="signin"]',
          'input[name*="password"]',
          'input[name*="username"]',
          'input[name*="email"]',
          '.login-form',
          '.signin-form',
          '#login',
          '#signin',
          'button[type="submit"]'
        ];

        return indicators.some(selector => document.querySelector(selector) !== null);
      });

      // Also check URL for auth-related paths
      const currentUrl = this.page.url().toLowerCase();
      const authPaths = ['login', 'signin', 'auth', 'authenticate'];
      const hasAuthPath = authPaths.some(path => currentUrl.includes(path));

      return authIndicators || hasAuthPath;
    } catch (error) {
      console.error('Error detecting auth requirement:', error);
      return false;
    }
  }

  private async handleAuthentication(
    credentials: { username: string; password: string; type: 'basic' | 'oauth' }
  ): Promise<void> {
    if (!this.page) return;

    try {
      if (credentials.type === 'basic') {
        console.log('Attempting basic authentication...');
        
        // Try to find and fill username field
        const usernameSelectors = [
          'input[name="username"]',
          'input[name="email"]',
          'input[type="email"]',
          'input[id*="username"]',
          'input[id*="email"]',
          'input[placeholder*="username"]',
          'input[placeholder*="email"]'
        ];

        for (const selector of usernameSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 2000 });
            await this.page.type(selector, credentials.username);
            console.log(`Filled username using selector: ${selector}`);
            break;
          } catch (e) {
            continue;
          }
        }

        // Try to find and fill password field
        const passwordSelectors = [
          'input[name="password"]',
          'input[type="password"]',
          'input[id*="password"]',
          'input[placeholder*="password"]'
        ];

        for (const selector of passwordSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 2000 });
            await this.page.type(selector, credentials.password);
            console.log(`Filled password using selector: ${selector}`);
            break;
          } catch (e) {
            continue;
          }
        }

        // Try to find and click submit button
        const submitSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button[id*="login"]',
          'button[id*="signin"]',
          '.login-button',
          '.signin-button'
        ];

        for (const selector of submitSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 2000 });
            await this.page.click(selector);
            console.log(`Clicked submit using selector: ${selector}`);
            break;
          } catch (e) {
            continue;
          }
        }

        // Wait for navigation after login
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
          console.log('No navigation after login attempt');
        });
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      // Don't throw - continue with scraping even if auth fails
    }
  }

  private async extractSelectors(): Promise<Record<string, string[]>> {
    if (!this.page) return {};

    try {
      const selectors = await this.page.evaluate(() => {
        const result: Record<string, string[]> = {
          buttons: [],
          inputs: [],
          links: [],
          forms: [],
          clickable: [],
          interactive: []
        };

        // Extract buttons
        const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
        buttons.forEach((btn, index) => {
          const id = btn.id;
          const className = btn.className;
          const name = (btn as any).name;
          const text = btn.textContent?.trim();
          
          if (id) result.buttons.push(`#${id}`);
          if (className) result.buttons.push(`.${className.split(' ')[0]}`);
          if (name) result.buttons.push(`[name="${name}"]`);
          if (text) result.buttons.push(`button:contains("${text.substring(0, 30)}")`);
          
          // Generic selector as fallback
          result.buttons.push(`button:nth-child(${index + 1})`);
        });

        // Extract input fields
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input, index) => {
          const id = input.id;
          const className = input.className;
          const name = (input as any).name;
          const type = (input as any).type;
          const placeholder = (input as any).placeholder;
          
          if (id) result.inputs.push(`#${id}`);
          if (className) result.inputs.push(`.${className.split(' ')[0]}`);
          if (name) result.inputs.push(`[name="${name}"]`);
          if (type) result.inputs.push(`input[type="${type}"]`);
          if (placeholder) result.inputs.push(`[placeholder="${placeholder}"]`);
          
          result.inputs.push(`${input.tagName.toLowerCase()}:nth-child(${index + 1})`);
        });

        // Extract links
        const links = document.querySelectorAll('a[href]');
        links.forEach((link, index) => {
          const id = link.id;
          const className = link.className;
          const href = (link as any).href;
          const text = link.textContent?.trim();
          
          if (id) result.links.push(`#${id}`);
          if (className) result.links.push(`.${className.split(' ')[0]}`);
          if (text) result.links.push(`a:contains("${text.substring(0, 30)}")`);
          if (href) result.links.push(`a[href="${href}"]`);
          
          result.links.push(`a:nth-child(${index + 1})`);
        });

        // Extract forms
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
          const id = form.id;
          const className = form.className;
          const action = (form as any).action;
          
          if (id) result.forms.push(`#${id}`);
          if (className) result.forms.push(`.${className.split(' ')[0]}`);
          if (action) result.forms.push(`form[action="${action}"]`);
          
          result.forms.push(`form:nth-child(${index + 1})`);
        });

        // Extract clickable elements
        const clickableElements = document.querySelectorAll('[onclick], [role="button"], .btn, .button');
        clickableElements.forEach((el, index) => {
          const id = el.id;
          const className = el.className;
          const role = el.getAttribute('role');
          
          if (id) result.clickable.push(`#${id}`);
          if (className) result.clickable.push(`.${className.split(' ')[0]}`);
          if (role) result.clickable.push(`[role="${role}"]`);
          
          result.clickable.push(`${el.tagName.toLowerCase()}:nth-child(${index + 1})`);
        });

        // Combine all interactive elements
        result.interactive = [
          ...result.buttons,
          ...result.inputs,
          ...result.links,
          ...result.clickable
        ];

        // Remove duplicates and empty strings
        Object.keys(result).forEach(key => {
          result[key] = [...new Set(result[key].filter(Boolean))];
        });

        return result;
      });

      return selectors;
    } catch (error) {
      console.error('Error extracting selectors:', error);
      return {};
    }
  }

  private async takeScreenshots(): Promise<string[]> {
    if (!this.page) return [];

    try {
      const screenshotDir = join(process.cwd(), 'screenshots');
      await mkdir(screenshotDir, { recursive: true });

      const timestamp = Date.now();
      const screenshotPath = join(screenshotDir, `screenshot-${timestamp}.png`);

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      return [screenshotPath];
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return [];
    }
  }

  async executeAutomationScript(script: string): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.page) {
      return { success: false, error: 'Puppeteer not initialized' };
    }

    try {
      console.log('Executing automation script:', script);

      // Create a safe execution environment
      const wrappedScript = `
        (async () => {
          const page = arguments[0];
          try {
            ${script}
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })
      `;

      const result = await this.page.evaluate(wrappedScript, this.page);
      
      if (result.success) {
        console.log('Script executed successfully');
        return { success: true, result };
      } else {
        console.error('Script execution failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error executing automation script:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown execution error' 
      };
    }
  }

  async getCurrentPageInfo(): Promise<{ url: string; title: string; html: string }> {
    if (!this.page) {
      throw new Error('Puppeteer not initialized');
    }

    return {
      url: this.page.url(),
      title: await this.page.title(),
      html: await this.page.content(),
    };
  }

  async waitForNavigation(timeout: number = 10000): Promise<void> {
    if (!this.page) return;

    try {
      await this.page.waitForNavigation({ 
        waitUntil: 'networkidle2', 
        timeout 
      });
    } catch (error) {
      console.log('Navigation timeout or no navigation occurred');
    }
  }

  async takeScreenshot(filename?: string): Promise<string> {
    if (!this.page) {
      throw new Error('Puppeteer not initialized');
    }

    const screenshotDir = join(process.cwd(), 'screenshots');
    await mkdir(screenshotDir, { recursive: true });

    const timestamp = Date.now();
    const screenshotPath = join(screenshotDir, filename || `screenshot-${timestamp}.png`);

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    return screenshotPath;
  }
}

export const puppeteerService = new PuppeteerService();
