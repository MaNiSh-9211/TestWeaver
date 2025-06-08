import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import MatrixBackground from '@/components/MatrixBackground';
import ThreeBackground from '@/components/ThreeBackground';
import {
  Bot,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Globe,
  Timer,
  AlertTriangle
} from 'lucide-react';

export default function Reports() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<string>('30');

  // Fetch projects for filter
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch all executions for reporting
  const { data: allExecutions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['/api/reports/executions', selectedProject, dateRange],
    queryFn: async () => {
      if (projects.length === 0) return [];
      
      const targetProjects = selectedProject === 'all' ? projects : projects.filter((p: any) => p.id.toString() === selectedProject);
      
      const allExecutions = await Promise.all(
        targetProjects.map(async (project: any) => {
          try {
            const response = await fetch(`/api/projects/${project.id}/executions`);
            if (response.ok) {
              const executions = await response.json();
              return executions.map((e: any) => ({ ...e, projectName: project.name, projectUrl: project.baseUrl }));
            }
            return [];
          } catch {
            return [];
          }
        })
      );
      
      const flatExecutions = allExecutions.flat();
      
      // Filter by date range
      const now = new Date();
      const daysAgo = new Date(now.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);
      
      return flatExecutions.filter((execution: any) => 
        new Date(execution.createdAt) >= daysAgo
      ).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: projects.length > 0,
  });

  // Filter executions based on search and status
  const filteredExecutions = allExecutions.filter((execution: any) => {
    const matchesSearch = !searchTerm || 
      execution.userStory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.jiraTicketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: filteredExecutions.length,
    completed: filteredExecutions.filter((e: any) => e.status === 'completed').length,
    failed: filteredExecutions.filter((e: any) => e.status === 'failed').length,
    running: filteredExecutions.filter((e: any) => e.status === 'running' || e.status === 'pending').length,
    successRate: filteredExecutions.length > 0 ? 
      Math.round((filteredExecutions.filter((e: any) => e.status === 'completed').length / filteredExecutions.length) * 100) : 0
  };

  // Calculate average execution time
  const completedExecutions = filteredExecutions.filter((e: any) => 
    e.status === 'completed' && e.startedAt && e.completedAt
  );
  
  const avgExecutionTime = completedExecutions.length > 0 ? 
    Math.round(
      completedExecutions.reduce((sum: number, e: any) => 
        sum + (new Date(e.completedAt).getTime() - new Date(e.startedAt).getTime()), 0
      ) / completedExecutions.length / 1000
    ) : 0;

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
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
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
              <span className="text-xl font-bold">Test Reports</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-600 hover:border-cyan-400">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Test <span className="text-cyan-400">Reports</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Comprehensive analytics and insights for your automation tests
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-black/40 backdrop-blur-lg border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600">
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tests..."
                    className="pl-10 bg-gray-900/50 border-gray-600"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-cyan-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Tests</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {executionsLoading ? <LoadingSpinner size="sm" /> : stats.total}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-cyan-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-emerald-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {executionsLoading ? <LoadingSpinner size="sm" /> : stats.completed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-red-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-400">
                    {executionsLoading ? <LoadingSpinner size="sm" /> : stats.failed}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {executionsLoading ? <LoadingSpinner size="sm" /> : `${stats.successRate}%`}
                  </p>
                </div>
                {stats.successRate >= 80 ? (
                  <TrendingUp className="w-8 h-8 text-emerald-400/50" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-400/50" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-yellow-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Duration</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {executionsLoading ? <LoadingSpinner size="sm" /> : `${avgExecutionTime}s`}
                  </p>
                </div>
                <Timer className="w-8 h-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executions Table */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <BarChart3 className="w-5 h-5" />
              Test Execution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executionsLoading ? (
              <div className="text-center py-16">
                <LoadingSpinner className="mx-auto mb-4" />
                <p className="text-gray-400">Loading test reports...</p>
              </div>
            ) : filteredExecutions.length === 0 ? (
              <div className="text-center py-16">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Test Data Found</h3>
                <p className="text-gray-400 mb-4">
                  {allExecutions.length === 0 
                    ? "No test executions have been run yet" 
                    : "No executions match your current filters"
                  }
                </p>
                {allExecutions.length === 0 && (
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-cyan-400 to-purple-600">
                      Run Your First Test
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExecutions.map((execution: any) => (
                  <Link key={execution.id} href={`/test/${execution.id}`}>
                    <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-purple-400/50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          {getStatusIcon(execution.status)}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {execution.userStory.substring(0, 80)}
                                {execution.userStory.length > 80 && '...'}
                              </h4>
                              {execution.jiraTicketId && (
                                <Badge variant="outline" className="border-purple-400/30 text-purple-400 text-xs">
                                  {execution.jiraTicketId}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span>{execution.projectName}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(execution.createdAt).toLocaleString()}</span>
                              </div>
                              
                              {execution.startedAt && execution.completedAt && (
                                <div className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  <span>
                                    {Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s
                                  </span>
                                </div>
                              )}
                              
                              {execution.totalSteps > 0 && (
                                <span>
                                  {execution.completedSteps}/{execution.totalSteps} steps
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status}
                          </Badge>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      {execution.errorMessage && (
                        <div className="mt-3 p-2 bg-red-900/20 border border-red-400/30 rounded text-sm text-red-400">
                          {execution.errorMessage.substring(0, 100)}
                          {execution.errorMessage.length > 100 && '...'}
                        </div>
                      )}
                    </div>
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
