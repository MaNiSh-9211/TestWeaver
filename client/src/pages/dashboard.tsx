import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MatrixBackground from '@/components/MatrixBackground';
import ThreeBackground from '@/components/ThreeBackground';
import {
  Bot,
  Plus,
  Play,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Globe,
  Zap,
  Brain,
  LogOut,
  User
} from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  baseUrl: z.string().url('Please enter a valid URL'),
  authRequired: z.boolean().default(false),
  username: z.string().optional(),
  password: z.string().optional(),
});

const testSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  userStory: z.string().min(10, 'User story must be at least 10 characters'),
  jiraTicketId: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type TestFormData = z.infer<typeof testSchema>;

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTest, setShowNewTest] = useState(false);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Fetch recent executions for all projects
  const { data: recentExecutions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['/api/recent-executions'],
    queryFn: async () => {
      if (projects.length === 0) return [];
      
      const allExecutions = await Promise.all(
        projects.map(async (project: any) => {
          try {
            const response = await fetch(`/api/projects/${project.id}/executions`);
            if (response.ok) {
              const executions = await response.json();
              return executions.slice(0, 5); // Get last 5 executions per project
            }
            return [];
          } catch {
            return [];
          }
        })
      );
      
      return allExecutions.flat().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10); // Show last 10 executions overall
    },
    enabled: projects.length > 0,
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

  // Test form
  const testForm = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      projectId: '',
      userStory: '',
      jiraTicketId: '',
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

  // Execute test mutation
  const executeTestMutation = useMutation({
    mutationFn: async (data: TestFormData) => {
      return apiRequest('POST', '/api/test/execute', {
        projectId: data.projectId,
        userStory: data.userStory,
        jiraTicketId: data.jiraTicketId || null,
      });
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recent-executions'] });
      setShowNewTest(false);
      testForm.reset();
      toast({
        title: 'Test Started',
        description: 'Your test execution has been queued and will start shortly',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running':
        return <Activity className="w-4 h-4 text-cyan-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30';
      case 'failed':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      case 'running':
        return 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30';
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
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
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  TestWeaver
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard">
                <span className="text-cyan-400 cursor-pointer">Dashboard</span>
              </Link>
              <Link href="/reports">
                <span className="hover:text-cyan-400 transition-colors cursor-pointer">Reports</span>
              </Link>
              <Link href="/config">
                <span className="hover:text-cyan-400 transition-colors cursor-pointer">Configuration</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.firstName || user?.email || 'User'}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/api/logout'}
                    className="border-gray-600 hover:border-red-400 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to <span className="text-cyan-400">TestWeaver</span>
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered automation testing dashboard. Create projects, execute tests, and monitor results in real-time.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-cyan-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Projects</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {projectsLoading ? <LoadingSpinner size="sm" /> : projects.filter((p: any) => p.isActive).length}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-cyan-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Recent Tests</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {executionsLoading ? <LoadingSpinner size="sm" /> : recentExecutions.length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-emerald-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {executionsLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      `${recentExecutions.length > 0 ? 
                        Math.round((recentExecutions.filter((e: any) => e.status === 'completed').length / recentExecutions.length) * 100) 
                        : 0}%`
                    )}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-yellow-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Running Tests</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {executionsLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      recentExecutions.filter((e: any) => e.status === 'running' || e.status === 'pending').length
                    )}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Card className="bg-black/40 backdrop-blur-lg border-cyan-400/20 hover:border-cyan-400/50 transition-all cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create New Project</h3>
                  <p className="text-gray-400">Set up a new testing project with target website and configuration</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-lg border-cyan-400/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-cyan-400">Create New Project</DialogTitle>
              </DialogHeader>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
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
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Requires Authentication</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {projectForm.watch('authRequired') && (
                    <>
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
                    </>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createProjectMutation.isPending}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
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

          <Dialog open={showNewTest} onOpenChange={setShowNewTest}>
            <DialogTrigger asChild>
              <Card className="bg-black/40 backdrop-blur-lg border-emerald-400/20 hover:border-emerald-400/50 transition-all cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Execute Test</h3>
                  <p className="text-gray-400">Run a new test with AI-generated automation scripts</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-lg border-emerald-400/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-emerald-400">Execute New Test</DialogTitle>
              </DialogHeader>
              <Form {...testForm}>
                <form onSubmit={testForm.handleSubmit((data) => executeTestMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={testForm.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Project</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md text-white"
                          >
                            <option value="">Choose a project...</option>
                            {projects.map((project: any) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={testForm.control}
                    name="userStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Story</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="As a user, I want to..."
                            className="bg-gray-900/50 border-gray-600 text-white"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={testForm.control}
                    name="jiraTicketId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jira Ticket ID (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="TEST-123" className="bg-gray-900/50 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={executeTestMutation.isPending || projects.length === 0}
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500"
                    >
                      {executeTestMutation.isPending ? <LoadingSpinner size="sm" /> : 'Execute Test'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewTest(false)}
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

        {/* Recent Executions */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-400/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Brain className="w-5 h-5" />
              Recent Test Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executionsLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-400 mt-2">Loading executions...</p>
              </div>
            ) : recentExecutions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No test executions yet</p>
                <p className="text-sm text-gray-500">Create a project and run your first test to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExecutions.map((execution: any) => (
                  <Link key={execution.id} href={`/test/${execution.id}`}>
                    <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-purple-400/50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <p className="font-medium">{execution.userStory.substring(0, 60)}...</p>
                            <p className="text-sm text-gray-400">
                              {execution.jiraTicketId && `${execution.jiraTicketId} • `}
                              {new Date(execution.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card className="bg-black/40 backdrop-blur-lg border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Settings className="w-5 h-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-400 mt-2">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No projects created yet</p>
                <p className="text-sm text-gray-500">Create your first project to start testing</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project: any) => (
                  <Link key={project.id} href={`/config?project=${project.id}`}>
                    <Card className="bg-gray-900/30 border-gray-700 hover:border-cyan-400/50 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{project.name}</h3>
                          {project.authRequired && (
                            <Badge variant="outline" className="text-xs border-yellow-400/30 text-yellow-400">
                              Auth Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{project.baseUrl}</p>
                        {project.description && (
                          <p className="text-xs text-gray-500">{project.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
