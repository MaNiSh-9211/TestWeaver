import { apiRequest } from "./queryClient";

export const testWeaverApi = {
  // Project operations
  async getProjects() {
    return apiRequest('/api/projects');
  },

  async createProject(data: any) {
    return apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: number, data: any) {
    return apiRequest(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id: number) {
    return apiRequest(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Execution operations
  async getExecutions(projectId: number) {
    return apiRequest(`/api/projects/${projectId}/executions`);
  },

  async createExecution(data: any) {
    return apiRequest('/api/executions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getExecution(id: number) {
    return apiRequest(`/api/executions/${id}`);
  },

  async startExecution(id: number) {
    return apiRequest(`/api/executions/${id}/start`, {
      method: 'POST',
    });
  },

  async stopExecution(id: number) {
    return apiRequest(`/api/executions/${id}/stop`, {
      method: 'POST',
    });
  },

  // Test step operations
  async getTestSteps(executionId: number) {
    return apiRequest(`/api/executions/${executionId}/steps`);
  },

  // Webhook operations
  async simulateJiraWebhook(data: any) {
    return apiRequest('/api/webhook/jira/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Scraping operations
  async scrapeWebsite(data: any) {
    return apiRequest('/api/scrape', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};