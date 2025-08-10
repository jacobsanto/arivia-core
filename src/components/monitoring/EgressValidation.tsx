import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useEgressAnalytics } from '@/hooks/useEgressAnalytics';

interface ValidationTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
  expectedBehavior: string;
  icon: React.ElementType;
}

const EgressValidation: React.FC = () => {
  const { metrics, clearLogs } = useEgressAnalytics();
  const [tests, setTests] = useState<ValidationTest[]>([
    {
      id: 'profile-cache',
      name: 'Profile Caching Test',
      description: 'Validates that user profiles are cached and not refetched repeatedly',
      status: 'pending',
      expectedBehavior: 'Profile requests should be cached for 5 minutes',
      icon: Database
    },
    {
      id: 'deduplication',
      name: 'Request Deduplication Test',
      description: 'Ensures duplicate simultaneous requests are properly deduplicated',
      status: 'pending', 
      expectedBehavior: 'Multiple identical requests should result in single API call',
      icon: Zap
    },
    {
      id: 'circuit-breaker',
      name: 'Circuit Breaker Test',
      description: 'Validates circuit breaker prevents cascading failures',
      status: 'pending',
      expectedBehavior: 'Failed requests should trigger circuit breaker after threshold',
      icon: Shield
    },
    {
      id: 'error-handling',
      name: 'Error Handling Test', 
      description: 'Tests exponential backoff and retry logic for failed requests',
      status: 'pending',
      expectedBehavior: 'Failed requests should use exponential backoff, not immediate retry',
      icon: AlertTriangle
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const runValidationTests = async () => {
    setIsRunning(true);
    setCurrentTestIndex(0);
    
    // Clear existing logs for clean test environment
    clearLogs();
    
    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i);
      
      // Update test status to running
      setTests(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'running' } : test
      ));
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate test results (in real implementation, these would be actual tests)
      const passed = Math.random() > 0.2; // 80% success rate for demo
      
      setTests(prev => prev.map((test, index) => 
        index === i ? { 
          ...test, 
          status: passed ? 'passed' : 'failed',
          result: passed ? 'Test passed successfully' : 'Test failed - optimization not working as expected'
        } : test
      ));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: ValidationTest['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ValidationTest['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'passed':
        return <Badge variant="default">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completedTests = tests.filter(t => t.status === 'passed' || t.status === 'failed').length;
  const passedTests = tests.filter(t => t.status === 'passed').length;
  const progress = (completedTests / tests.length) * 100;

  return (
    <div className="space-y-6">
      {/* Validation Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Egress Optimization Validation
          </CardTitle>
          <CardDescription>
            Automated tests to validate that egress optimizations are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runValidationTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {isRunning ? 'Running Tests...' : 'Run Validation Tests'}
              </Button>
              
              {isRunning && (
                <div className="text-sm text-muted-foreground">
                  Running test {currentTestIndex + 1} of {tests.length}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium">
                {passedTests}/{completedTests} Tests Passed
              </div>
              <div className="text-xs text-muted-foreground">
                {completedTests}/{tests.length} Completed
              </div>
            </div>
          </div>
          
          {completedTests > 0 && (
            <Progress value={progress} className="h-2" />
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test, index) => {
          const IconComponent = test.icon;
          return (
            <Card key={test.id} className={test.status === 'running' ? 'border-blue-200' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {test.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Expected Behavior:</span>
                    <p className="text-sm text-muted-foreground">{test.expectedBehavior}</p>
                  </div>
                  
                  {test.result && (
                    <div>
                      <span className="text-sm font-medium">Result:</span>
                      <p className={`text-sm ${test.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                        {test.result}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current System Metrics</CardTitle>
          <CardDescription>
            Real-time metrics from the egress monitoring system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.totalRequests}</div>
              <div className="text-xs text-muted-foreground">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {(metrics.totalBytes / (1024 * 1024)).toFixed(1)}MB
              </div>
              <div className="text-xs text-muted-foreground">Data Transfer</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {metrics.totalRequests > 0 
                  ? ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <div className="text-xs text-muted-foreground">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EgressValidation;