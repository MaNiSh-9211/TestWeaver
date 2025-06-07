import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MatrixBackground from '@/components/MatrixBackground';
import ThreeBackground from '@/components/ThreeBackground';
import {
  Bot,
  ArrowLeft,
  Settings,
  Plus,
  Edit,
  Trash2,
  Globe,
  Lock,
  Unlock,
  Webhook,
  Key,
  Code,
  AlertTriangle,
  Copy,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  baseUrl: z.string().url('Please enter a valid URL'),
  authRequired: z.boolean().default(false),
  username: z.string().optional(),
  password: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function Configuration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Get project ID from URL params if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, []);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Project form
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      baseUrl: '',
      authRequired: false,
      username: '',
      password: '',
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const projectData = {
        name: data.name,
        description: data.description,
        baseUrl: data.baseUrl,
        authRequired: data.authRequired,
        authCredentials: data.authRequired ? {
          username: data.username || '',
          password: data.password || '',
          type: 'basic'
        } : null,
      };
      
      return apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowNewProject(false);
      projectForm.reset();
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData & { id: number }) => {
      const projectData = {
        name: data.name,
        description: data.description,
        baseUrl: data.baseUrl,
        authRequired: data.authRequired,
        authCredentials: data.authRequired ? {
          username: data.username || '',
          password: data.password || '',
          type: 'basic'
        } : null,
      };
      
      return apiRequest('PUT', `/api/projects/${data.id}`, projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditingProject(null);
      projectForm.reset();
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return apiRequest('DELETE', `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    projectForm.reset({
      name: project.name,
      description: project.description || '',
      baseUrl: project.baseUrl,
      authRequired: project.authRequired || false,
      username: project.authCredentials?.username || '',
      password: project.authCredentials?.password || '',
    });
  };

  const handleDeleteProject = (projectId: number, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied',
        description: 'Text copied to clipboard',
      });
    });
  };

  const generateWebhookUrl = () => {
    return `${window.location.origin}/api/webhook/jira`;
  };

  const generateTestCommand = (projectId: number) => {
    return `curl -X POST "${window.location.origin}/api/test/execute" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": ${projectId},
    "userStory": "As a user, I want to...",
    "jiraTicketId": "TEST-123"
  }'`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <MatrixBackground />
      <ThreeBackground />

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-lg border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Configuration</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-cyan-400">Configuration</span> Management
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your testing projects, webhook integrations, and automation settings
          </p>
        </div>

        {/* Quick Setup Guide */}
        <Card className="bg-black/40 backdrop-blur-lg border-emerald-400/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <Webhook className="w-5 h-5" />
              Jira Integration Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Webhook URL for Jira</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-900/50 border border-gray-600 rounded px-3 py-2 font-mono text-sm">
                  {generateWebhookUrl()}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generateWebhookUrl())}
                  className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add this URL as a webhook in your Jira project settings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div>
                <h4 className="font-medium text-emerald-400 mb-2">Required Custom Fields</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• customfield_10000 (User Story)</li>
                  <li>• customfield_10001 (Base URL)</li>
                  <li>• customfield_10002 (Credentials)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-emerald-400 mb-2">Supported Events</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• jira:issue_created</li>
                  <li>• jira:issue_updated</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-emerald-400 mb-2">Authentication</h4>
                <p className="text-sm text-gray-400">
                  Optional credentials can be provided in the custom field for authenticated websites.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">Projects</h2>
          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-purple-500 hover:to-cyan-500">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-lg border-purple-400/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-purple-400">Create New Project</DialogTitle>
              </DialogHeader>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={projectForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={projectForm.control}
                      name="baseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com" className="bg-gray-900/50 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="authRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                        <div>
                          <FormLabel>Authentication Required</FormLabel>
                          <p className="text-sm text-gray-400">Enable if the website requires login</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {projectForm.watch('authRequired') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/30 rounded-lg border border-gray-600">
                      <FormField
                        control={projectForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="bg-gray-900/50 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createProjectMutation.isPending}
                      className="bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-purple-500 hover:to-cyan-500"
                    >
                      {createProjectMutation.isPending ? <LoadingSpinner size="sm" /> : 'Create Project'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewProject(false)}
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects List */}
        {projectsLoading ? (
          <div className="text-center py-16">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-gray-700">
            <CardContent className="text-center py-16">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-gray-400 mb-4">Create your first project to start testing</p>
              <Button 
                onClick={() => setShowNewProject(true)}
                className="bg-gradient-to-r from-purple-400 to-cyan-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {projects.map((project: any) => (
              <Card 
                key={project.id} 
                className={`bg-black/40 backdrop-blur-lg transition-all ${
                  selectedProjectId === project.id.toString() 
                    ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/20' 
                    : 'border-gray-700 hover:border-purple-400/30'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        <div className="flex items-center gap-2">
                          {project.authRequired ? (
                            <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Auth Required
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-400/30 text-emerald-400 text-xs">
                              <Unlock className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {project.isActive ? (
                            <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-400/30 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/30 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <a 
                          href={project.baseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {project.baseUrl}
                          <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Created: {new Date(project.createdAt).toLocaleString()}
                        {project.updatedAt !== project.createdAt && (
                          <span> • Updated: {new Date(project.updatedAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProject(project)}
                        className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* API Example */}
                  <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-300">API Test Command</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generateTestCommand(project.id))}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
                      {generateTestCommand(project.id)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Project Dialog */}
        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent className="bg-black/90 backdrop-blur-lg border-purple-400/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-purple-400">Edit Project</DialogTitle>
            </DialogHeader>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit((data) => updateProjectMutation.mutate({ ...data, id: editingProject.id }))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="baseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com" className="bg-gray-900/50 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={projectForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="authRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <FormLabel>Authentication Required</FormLabel>
                        <p className="text-sm text-gray-400">Enable if the website requires login</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {projectForm.watch('authRequired') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/30 rounded-lg border border-gray-600">
                    <FormField
                      control={projectForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={projectForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" className="bg-gray-900/50 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateProjectMutation.isPending}
                    className="bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-purple-500 hover:to-cyan-500"
                  >
                    {updateProjectMutation.isPending ? <LoadingSpinner size="sm" /> : 'Update Project'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingProject(null)}
                    className="border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
