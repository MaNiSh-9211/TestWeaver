import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import MatrixBackground from '@/components/MatrixBackground';
import ThreeBackground from '@/components/ThreeBackground';
import {
  Bot,
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Brain,
  Eye,
  AlertTriangle,
  Code,
  Globe,
  Zap,
  Image as ImageIcon,
  Calendar,
  Timer
} from 'lucide-react';

export default function TestExecution() {
  const [match, params] = useRoute('/test/:executionId');
  const executionId = params?.executionId ? parseInt(params.executionId) : null;
  const { toast } = useToast();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);

  // Fetch execution details
  const { data: execution, isLoading: executionLoading, refetch: refetchExecution } = useQuery({
    queryKey: ['/api/executions', executionId],
    enabled: !!executionId,
  });

  // Fetch execution steps
  const { data: steps = [], isLoading: stepsLoading, refetch: refetchSteps } = useQuery({
    queryKey: ['/api/executions', executionId, 'steps'],
    enabled: !!executionId,
  });

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['/api/projects', execution?.projectId],
    enabled: !!execution?.projectId,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!executionId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to updates for this execution
      socket.send(JSON.stringify({
        type: 'subscribe',
        executionId: executionId
      }));
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket update:', data);
        
        setRealTimeUpdates(prev => [...prev, { ...data, timestamp: Date.now() }]);
        
        // Refetch data when execution completes
        if (data.type === 'execution_completed' || data.type === 'execution_failed') {
          setTimeout(() => {
            refetchExecution();
            refetchSteps();
          }, 1000);
        }
        
        // Show toast for important updates
        if (data.type === 'execution_completed') {
          toast({
            title: 'Test Completed',
            description: `Execution finished with status: ${data.status}`,
          });
        } else if (data.type === 'execution_failed') {
          toast({
            title: 'Test Failed',
            description: 'Execution failed. Check the details below.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [executionId, refetchExecution, refetchSteps, toast]);

  if (!match || !executionId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Execution ID</h1>
          <p className="text-gray-400 mb-4">The test execution you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-cyan-400 to-purple-600">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Activity className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
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

  const calculateProgress = () => {
    if (!execution || !execution.totalSteps) return 0;
    return Math.round((execution.completedSteps / execution.totalSteps) * 100);
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
              <span className="text-xl font-bold">Test Execution</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${ws ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-400">
                {ws ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {executionLoading ? (
          <div className="text-center py-16">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-gray-400">Loading test execution details...</p>
          </div>
        ) : !execution ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Execution Not Found</h1>
            <p className="text-gray-400">The test execution you're looking for doesn't exist.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Execution Overview */}
            <Card className="bg-black/40 backdrop-blur-lg border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-cyan-400">
                    {getStatusIcon(execution.status)}
                    Execution #{execution.id}
                  </CardTitle>
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Project</p>
                    <p className="font-medium">{project?.name || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Started</p>
                    <p className="font-medium">
                      {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Duration</p>
                    <p className="font-medium">
                      {execution.completedAt && execution.startedAt ? 
                        `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s` :
                        execution.startedAt ? 'Running...' : 'Not started'
                      }
                    </p>
                  </div>
                </div>

                {/* Progress */}
                {execution.totalSteps > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400">Progress</p>
                      <p className="text-sm text-gray-400">
                        {execution.completedSteps} / {execution.totalSteps} steps
                      </p>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>
                )}

                {/* User Story */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">User Story</p>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-200">{execution.userStory}</p>
                  </div>
                </div>

                {/* Jira Ticket */}
                {execution.jiraTicketId && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Jira Ticket</p>
                    <Badge variant="outline" className="border-purple-400/30 text-purple-400">
                      {execution.jiraTicketId}
                    </Badge>
                  </div>
                )}

                {/* Error Message */}
                {execution.errorMessage && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Error Details</p>
                    <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                      <p className="text-red-400">{execution.errorMessage}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Real-time Updates */}
            {realTimeUpdates.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-lg border-emerald-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-400">
                    <Zap className="w-5 h-5" />
                    Real-time Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {realTimeUpdates.slice(-10).reverse().map((update, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-900/30 rounded border border-gray-700">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-emerald-400">{update.type}</span>
                            <span className="text-gray-400 text-xs">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {update.description && (
                            <p className="text-gray-300 mt-1">{update.description}</p>
                          )}
                          {update.error && (
                            <p className="text-red-400 mt-1">{update.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Test Steps */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Brain className="w-5 h-5" />
                  Test Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stepsLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="text-gray-400 mt-2">Loading test steps...</p>
                  </div>
                ) : steps.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No test steps available yet</p>
                    <p className="text-sm text-gray-500">Steps will appear as the test execution progresses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {steps.map((step: any) => (
                      <Card key={step.id} className="bg-gray-900/30 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(step.status)}
                              <div>
                                <h4 className="font-medium">Step {step.stepNumber}</h4>
                                <p className="text-sm text-gray-400">{step.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(step.status)} variant="outline">
                                {step.status}
                              </Badge>
                              {step.executionTime && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {step.executionTime}ms
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Page URL */}
                          {step.pageUrl && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1">Page URL</p>
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                <span className="text-cyan-400 truncate">{step.pageUrl}</span>
                              </div>
                            </div>
                          )}

                          {/* AI Generated Script */}
                          {step.aiGeneratedScript && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1">Generated Code</p>
                              <div className="bg-black/50 border border-gray-600 rounded p-3 overflow-x-auto">
                                <pre className="text-xs text-emerald-400 font-mono">
                                  {step.aiGeneratedScript}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Screenshot */}
                          {step.screenshotPath && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1">Screenshot</p>
                              <div className="flex items-center gap-2 text-sm">
                                <ImageIcon className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-400">Screenshot captured</span>
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {step.errorMessage && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 mb-1">Error</p>
                              <div className="bg-red-900/20 border border-red-400/30 rounded p-2">
                                <p className="text-red-400 text-sm">{step.errorMessage}</p>
                              </div>
                            </div>
                          )}

                          {/* Extracted Selectors */}
                          {step.extractedSelectors && step.extractedSelectors.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-2">Extracted Selectors</p>
                              <div className="flex flex-wrap gap-1">
                                {step.extractedSelectors.slice(0, 5).map((selector: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                    {selector}
                                  </Badge>
                                ))}
                                {step.extractedSelectors.length > 5 && (
                                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                    +{step.extractedSelectors.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
