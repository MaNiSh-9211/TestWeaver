// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Link } from 'wouter';
// import Navigation from '@/components/Navigation';
// import WebhookConfig from '@/components/WebhookConfig';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Separator } from '@/components/ui/separator';
// import { useToast } from '@/hooks/use-toast';
// import { testWeaverApi } from '@/lib/testWeaverApi';
// import { 
//   Activity,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Play,
//   Plus,
//   ExternalLink,
//   Bot,
//   Zap,
//   Database,
//   Users,
//   TrendingUp
// } from 'lucide-react';

// const Dashboard = () => {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [selectedConfig, setSelectedConfig] = useState<number | null>(null);

//   // Fetch dashboard summary
//   const { data: summary, isLoading: summaryLoading } = useQuery({
//     queryKey: ['/api/dashboard/summary'],
//     refetchInterval: 30000 // Refresh every 30 seconds
//   });

//   // Fetch test configurations
//   const { data: configurations, isLoading: configsLoading } = useQuery({
//     queryKey: ['/api/test-configurations']
//   });

//   // Fetch recent executions for selected config
//   const { data: executions, isLoading: executionsLoading } = useQuery({
//     queryKey: ['/api/test-executions', selectedConfig],
//     enabled: !!selectedConfig
//   });

//   // Start test execution mutation
//   const startExecutionMutation = useMutation({
//     mutationFn: testWeaverApi.startTestExecution,
//     onSuccess: (data) => {
//       toast({
//         title: "Test Execution Started",
//         description: `Execution ${data.executionId} has been started successfully`,
//       });
//       queryClient.invalidateQueries({ queryKey: ['/api/test-executions'] });
//       queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Failed to Start Execution",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed': return 'bg-green-500';
//       case 'failed': return 'bg-red-500';
//       case 'running': return 'bg-blue-500';
//       case 'pending': return 'bg-yellow-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed': return <CheckCircle className="w-4 h-4" />;
//       case 'failed': return <XCircle className="w-4 h-4" />;
//       case 'running': return <Activity className="w-4 h-4 animate-spin" />;
//       case 'pending': return <Clock className="w-4 h-4" />;
//       default: return <Clock className="w-4 h-4" />;
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       <Navigation />
      
//       <div className="pt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* Header */}
//           <div className="mb-8 animate-slide-up">
//             <h1 className="text-3xl font-bold mb-2">
//               <span className="neon-blue">TestWeaver</span> Dashboard
//             </h1>
//             <p className="text-gray-400">
//               Monitor and manage your AI-powered automation testing workflows
//             </p>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
//             <Card className="glass-card">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-400">Active Executions</p>
//                     <p className="text-2xl font-bold neon-blue">
//                       {summaryLoading ? '...' : summary?.activeExecutions || 0}
//                     </p>
//                   </div>
//                   <Activity className="w-8 h-8 text-blue-400" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="glass-card">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-400">Total Executions</p>
//                     <p className="text-2xl font-bold neon-green">
//                       {summaryLoading ? '...' : summary?.totalExecutions || 0}
//                     </p>
//                   </div>
//                   <Database className="w-8 h-8 text-green-400" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="glass-card">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-400">Success Rate</p>
//                     <p className="text-2xl font-bold neon-purple">
//                       {summaryLoading ? '...' : `${summary?.successRate || 0}%`}
//                     </p>
//                   </div>
//                   <TrendingUp className="w-8 h-8 text-purple-400" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="glass-card">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-400">Connected Clients</p>
//                     <p className="text-2xl font-bold neon-blue">
//                       {summaryLoading ? '...' : summary?.connectedClients || 0}
//                     </p>
//                   </div>
//                   <Users className="w-8 h-8 text-cyan-400" />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Content */}
//           <Tabs defaultValue="configurations" className="animate-slide-up">
//             <TabsList className="grid w-full grid-cols-3 glass-morphism">
//               <TabsTrigger value="configurations">Test Configurations</TabsTrigger>
//               <TabsTrigger value="executions">Recent Executions</TabsTrigger>
//               <TabsTrigger value="webhooks">Webhook Settings</TabsTrigger>
//             </TabsList>

//             {/* Test Configurations Tab */}
//             <TabsContent value="configurations" className="space-y-6">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold">Test Configurations</h2>
//                 <Button className="btn-cyber">
//                   <Plus className="w-4 h-4 mr-2" />
//                   New Configuration
//                 </Button>
//               </div>

//               {configsLoading ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {[1, 2, 3].map((i) => (
//                     <Card key={i} className="glass-card animate-pulse">
//                       <CardContent className="p-6">
//                         <div className="h-4 bg-gray-600 rounded mb-2"></div>
//                         <div className="h-3 bg-gray-700 rounded mb-4 w-2/3"></div>
//                         <div className="h-8 bg-gray-600 rounded"></div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               ) : configurations && configurations.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {configurations.map((config: any) => (
//                     <Card key={config.id} className="glass-card hover-lift cursor-pointer">
//                       <CardHeader>
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <CardTitle className="text-lg">{config.jiraTicketId}</CardTitle>
//                             <p className="text-sm text-gray-400">{config.projectKey}</p>
//                           </div>
//                           <Badge variant="outline" className="border-cyan-500 text-cyan-400">
//                             <Bot className="w-3 h-3 mr-1" />
//                             AI Ready
//                           </Badge>
//                         </div>
//                       </CardHeader>
//                       <CardContent>
//                         <p className="text-sm text-gray-300 mb-4 line-clamp-2">
//                           {config.userStory}
//                         </p>
                        
//                         <div className="flex items-center text-xs text-gray-500 mb-4">
//                           <ExternalLink className="w-3 h-3 mr-1" />
//                           <span className="truncate">{config.targetUrl}</span>
//                         </div>

//                         <Separator className="my-4" />

//                         <div className="flex justify-between items-center">
//                           <Button
//                             size="sm"
//                             onClick={() => setSelectedConfig(config.id)}
//                             variant="outline"
//                             className="border-gray-600 hover:border-cyan-500"
//                           >
//                             View Details
//                           </Button>
                          
//                           <Button
//                             size="sm"
//                             onClick={() => startExecutionMutation.mutate(config.id)}
//                             disabled={startExecutionMutation.isPending}
//                             className="bg-gradient-to-r from-cyan-500 to-purple-600"
//                           >
//                             {startExecutionMutation.isPending ? (
//                               <Activity className="w-3 h-3 mr-1 animate-spin" />
//                             ) : (
//                               <Play className="w-3 h-3 mr-1" />
//                             )}
//                             Run Test
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card className="glass-card">
//                   <CardContent className="p-12 text-center">
//                     <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold mb-2">No Test Configurations</h3>
//                     <p className="text-gray-400 mb-6">
//                       Create your first test configuration or set up Jira webhooks to get started
//                     </p>
//                     <Button className="btn-cyber">
//                       <Plus className="w-4 h-4 mr-2" />
//                       Create Configuration
//                     </Button>
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>

//             {/* Executions Tab */}
//             <TabsContent value="executions" className="space-y-6">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold">Recent Executions</h2>
//                 {selectedConfig && (
//                   <Badge variant="outline" className="border-cyan-500 text-cyan-400">
//                     Config #{selectedConfig}
//                   </Badge>
//                 )}
//               </div>

//               {executionsLoading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3].map((i) => (
//                     <Card key={i} className="glass-card animate-pulse">
//                       <CardContent className="p-6">
//                         <div className="flex justify-between items-center">
//                           <div className="flex-1">
//                             <div className="h-4 bg-gray-600 rounded mb-2 w-1/3"></div>
//                             <div className="h-3 bg-gray-700 rounded w-1/2"></div>
//                           </div>
//                           <div className="h-6 bg-gray-600 rounded w-16"></div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               ) : executions && executions.length > 0 ? (
//                 <div className="space-y-4">
//                   {executions.map((execution: any) => (
//                     <Card key={execution.id} className="glass-card hover-lift">
//                       <CardContent className="p-6">
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <h3 className="font-semibold">Execution #{execution.id}</h3>
//                               <Badge 
//                                 className={`${getStatusColor(execution.status)} text-white flex items-center gap-1`}
//                               >
//                                 {getStatusIcon(execution.status)}
//                                 {execution.status}
//                               </Badge>
//                             </div>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
//                               <div>
//                                 <p className="text-gray-400">Steps</p>
//                                 <p className="font-medium">
//                                   {execution.completedSteps || 0} / {execution.totalSteps || 0}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-gray-400">Started</p>
//                                 <p className="font-medium">
//                                   {execution.startedAt 
//                                     ? new Date(execution.startedAt).toLocaleTimeString()
//                                     : 'N/A'
//                                   }
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-gray-400">Duration</p>
//                                 <p className="font-medium">
//                                   {execution.completedAt && execution.startedAt
//                                     ? `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s`
//                                     : 'Running...'
//                                   }
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-gray-400">Success Rate</p>
//                                 <p className="font-medium">
//                                   {execution.totalSteps > 0 
//                                     ? `${Math.round((execution.completedSteps / execution.totalSteps) * 100)}%`
//                                     : '0%'
//                                   }
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
                          
//                           <div className="flex gap-2">
//                             <Link href={`/test-execution/${execution.id}`}>
//                               <Button size="sm" variant="outline" className="border-gray-600 hover:border-cyan-500">
//                                 <ExternalLink className="w-3 h-3 mr-1" />
//                                 View
//                               </Button>
//                             </Link>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card className="glass-card">
//                   <CardContent className="p-12 text-center">
//                     <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold mb-2">No Executions</h3>
//                     <p className="text-gray-400 mb-6">
//                       {selectedConfig 
//                         ? 'No executions found for this configuration'
//                         : 'Select a configuration to view its executions'
//                       }
//                     </p>
//                     {!selectedConfig && (
//                       <p className="text-sm text-gray-500">
//                         Click on "View Details" for any configuration above
//                       </p>
//                     )}
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>

//             {/* Webhooks Tab */}
//             <TabsContent value="webhooks" className="space-y-6">
//               <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-2">Webhook Configuration</h2>
//                 <p className="text-gray-400">
//                   Configure Jira webhooks to automatically trigger test executions
//                 </p>
//               </div>
              
//               <WebhookConfig />
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


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

interface User {
  firstName?: string;
  email?: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  baseUrl: string;
  authRequired: boolean;
  authCredentials?: {
    username: string;
    password: string;
    type: 'basic' | 'oauth';
  };
}

interface TestExecution {
  id: number;
  projectId: number;
  userStory: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
}

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
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTest, setShowNewTest] = useState(false);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch recent executions for all projects
  const { data: recentExecutions = [], isLoading: executionsLoading } = useQuery<TestExecution[]>({
    queryKey: ['/api/recent-executions'],
    queryFn: async () => {
      if (projects.length === 0) return [];
      
      const allExecutions = await Promise.all(
        projects.map(async (project: Project) => {
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
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
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
          type: 'basic' as const
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
    onError: (error: Error) => {
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
        projectId: parseInt(data.projectId),
        userStory: data.userStory,
        jiraTicketId: data.jiraTicketId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recent-executions'] });
      setShowNewTest(false);
      testForm.reset();
      toast({
        title: 'Test Started',
        description: 'Your test execution has been queued and will start shortly',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusIcon = (status: TestExecution['status']) => {
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

  const getStatusColor = (status: TestExecution['status']) => {
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
                              {new Date(execution.startedAt).toLocaleString()}
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
