import { apiRequest } from "./queryClient";

export const testWeaverApi = {
  // Project operations
  async getProjects() {
    return apiRequest('GET', '/api/projects');
  },

  async createProject(data: any) {
    return apiRequest('POST', '/api/projects', data);
  },

  async updateProject(id: number, data: any) {
    return apiRequest('PATCH', `/api/projects/${id}`, data);
  },

  async deleteProject(id: number) {
    return apiRequest('DELETE', `/api/projects/${id}`);
  },

  // Execution operations
  async getExecutions(projectId: number) {
    return apiRequest('GET', `/api/projects/${projectId}/executions`);
  },

  async createExecution(data: any) {
    return apiRequest('POST', '/api/executions', data);
  },

  async getExecution(id: number) {
    return apiRequest('GET', `/api/executions/${id}`);
  },

  async startExecution(id: number) {
    return apiRequest('POST', `/api/executions/${id}/start`);
  },

  async stopExecution(id: number) {
    return apiRequest('POST', `/api/executions/${id}/stop`);
  },

  // Test step operations
  async getTestSteps(executionId: number) {
    return apiRequest('GET', `/api/executions/${executionId}/steps`);
  },

  // Webhook operations
  async simulateJiraWebhook(data: any) {
    return apiRequest('POST', '/api/webhook/jira/simulate', data);
  },

  // Scraping operations
  async scrapeWebsite(data: any) {
    return apiRequest('POST', '/api/scrape', data);
  },
};