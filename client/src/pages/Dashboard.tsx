import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';
import WebhookConfig from '@/components/WebhookConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { testWeaverApi } from '@/lib/testWeaverApi';
import { 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Plus,
  ExternalLink,
  Bot,
  Zap,
  Database,
  Users,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConfig, setSelectedConfig] = useState<number | null>(null);

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch test configurations
  const { data: configurations, isLoading: configsLoading } = useQuery({
    queryKey: ['/api/test-configurations']
  });

  // Fetch recent executions for selected config
  const { data: executions, isLoading: executionsLoading } = useQuery({
    queryKey: ['/api/test-executions', selectedConfig],
    enabled: !!selectedConfig
  });

  // Start test execution mutation
  const startExecutionMutation = useMutation({
    mutationFn: testWeaverApi.startTestExecution,
    onSuccess: (data) => {
      toast({
        title: "Test Execution Started",
        description: `Execution ${data.executionId} has been started successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/test-executions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Execution",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold mb-2">
              <span className="neon-blue">TestWeaver</span> Dashboard
            </h1>
            <p className="text-gray-400">
              Monitor and manage your AI-powered automation testing workflows
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Executions</p>
                    <p className="text-2xl font-bold neon-blue">
                      {summaryLoading ? '...' : summary?.activeExecutions || 0}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Executions</p>
                    <p className="text-2xl font-bold neon-green">
                      {summaryLoading ? '...' : summary?.totalExecutions || 0}
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold neon-purple">
                      {summaryLoading ? '...' : `${summary?.successRate || 0}%`}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Connected Clients</p>
                    <p className="text-2xl font-bold neon-blue">
                      {summaryLoading ? '...' : summary?.connectedClients || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="configurations" className="animate-slide-up">
            <TabsList className="grid w-full grid-cols-3 glass-morphism">
              <TabsTrigger value="configurations">Test Configurations</TabsTrigger>
              <TabsTrigger value="executions">Recent Executions</TabsTrigger>
              <TabsTrigger value="webhooks">Webhook Settings</TabsTrigger>
            </TabsList>

            {/* Test Configurations Tab */}
            <TabsContent value="configurations" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Test Configurations</h2>
                <Button className="btn-cyber">
                  <Plus className="w-4 h-4 mr-2" />
                  New Configuration
                </Button>
              </div>

              {configsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="glass-card animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded mb-4 w-2/3"></div>
                        <div className="h-8 bg-gray-600 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : configurations && configurations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {configurations.map((config: any) => (
                    <Card key={config.id} className="glass-card hover-lift cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{config.jiraTicketId}</CardTitle>
                            <p className="text-sm text-gray-400">{config.projectKey}</p>
                          </div>
                          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                            <Bot className="w-3 h-3 mr-1" />
                            AI Ready
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {config.userStory}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span className="truncate">{config.targetUrl}</span>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-center">
                          <Button
                            size="sm"
                            onClick={() => setSelectedConfig(config.id)}
                            variant="outline"
                            className="border-gray-600 hover:border-cyan-500"
                          >
                            View Details
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => startExecutionMutation.mutate(config.id)}
                            disabled={startExecutionMutation.isPending}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600"
                          >
                            {startExecutionMutation.isPending ? (
                              <Activity className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 mr-1" />
                            )}
                            Run Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-12 text-center">
                    <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Test Configurations</h3>
                    <p className="text-gray-400 mb-6">
                      Create your first test configuration or set up Jira webhooks to get started
                    </p>
                    <Button className="btn-cyber">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Configuration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Executions Tab */}
            <TabsContent value="executions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Executions</h2>
                {selectedConfig && (
                  <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                    Config #{selectedConfig}
                  </Badge>
                )}
              </div>

              {executionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="glass-card animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="h-4 bg-gray-600 rounded mb-2 w-1/3"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 bg-gray-600 rounded w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : executions && executions.length > 0 ? (
                <div className="space-y-4">
                  {executions.map((execution: any) => (
                    <Card key={execution.id} className="glass-card hover-lift">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">Execution #{execution.id}</h3>
                              <Badge 
                                className={`${getStatusColor(execution.status)} text-white flex items-center gap-1`}
                              >
                                {getStatusIcon(execution.status)}
                                {execution.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Steps</p>
                                <p className="font-medium">
                                  {execution.completedSteps || 0} / {execution.totalSteps || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Started</p>
                                <p className="font-medium">
                                  {execution.startedAt 
                                    ? new Date(execution.startedAt).toLocaleTimeString()
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Duration</p>
                                <p className="font-medium">
                                  {execution.completedAt && execution.startedAt
                                    ? `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s`
                                    : 'Running...'
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Success Rate</p>
                                <p className="font-medium">
                                  {execution.totalSteps > 0 
                                    ? `${Math.round((execution.completedSteps / execution.totalSteps) * 100)}%`
                                    : '0%'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/test-execution/${execution.id}`}>
                              <Button size="sm" variant="outline" className="border-gray-600 hover:border-cyan-500">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-12 text-center">
                    <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Executions</h3>
                    <p className="text-gray-400 mb-6">
                      {selectedConfig 
                        ? 'No executions found for this configuration'
                        : 'Select a configuration to view its executions'
                      }
                    </p>
                    {!selectedConfig && (
                      <p className="text-sm text-gray-500">
                        Click on "View Details" for any configuration above
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Webhook Configuration</h2>
                <p className="text-gray-400">
                  Configure Jira webhooks to automatically trigger test executions
                </p>
              </div>
              
              <WebhookConfig />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
