import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Image, 
  Database, 
  Globe, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Gauge
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  description: string;
  suggestions: string[];
}

interface OptimizationStatus {
  category: string;
  items: {
    name: string;
    status: 'completed' | 'in-progress' | 'pending';
    impact: 'high' | 'medium' | 'low';
    description: string;
  }[];
}

const PerformanceOptimization = () => {
  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'First Contentful Paint',
      score: 92,
      status: 'excellent',
      description: 'Time until the first content appears on screen',
      suggestions: ['Optimize critical CSS', 'Reduce server response time']
    },
    {
      name: 'Largest Contentful Paint',
      score: 88,
      status: 'good',
      description: 'Time until the largest content element appears',
      suggestions: ['Optimize images', 'Improve server response time']
    },
    {
      name: 'First Input Delay',
      score: 96,
      status: 'excellent',
      description: 'Time from first user interaction to browser response',
      suggestions: ['Minimize JavaScript execution time']
    },
    {
      name: 'Cumulative Layout Shift',
      score: 78,
      status: 'needs-improvement',
      description: 'Visual stability of the page during loading',
      suggestions: ['Set explicit dimensions for images', 'Reserve space for dynamic content']
    }
  ];

  const optimizationStatus: OptimizationStatus[] = [
    {
      category: 'Code Optimization',
      items: [
        {
          name: 'React.lazy() Components',
          status: 'completed',
          impact: 'high',
          description: 'Lazy load non-critical components to reduce initial bundle size'
        },
        {
          name: 'Bundle Splitting',
          status: 'completed',
          impact: 'high',
          description: 'Split code into smaller chunks for better caching'
        },
        {
          name: 'Tree Shaking',
          status: 'completed',
          impact: 'medium',
          description: 'Remove unused code from final bundle'
        },
        {
          name: 'Minification',
          status: 'completed',
          impact: 'medium',
          description: 'Compress JavaScript and CSS files'
        }
      ]
    },
    {
      category: 'Asset Optimization',
      items: [
        {
          name: 'Image Compression',
          status: 'in-progress',
          impact: 'high',
          description: 'Optimize images for web delivery'
        },
        {
          name: 'WebP Format',
          status: 'pending',
          impact: 'medium',
          description: 'Convert images to modern WebP format'
        },
        {
          name: 'SVG Optimization',
          status: 'completed',
          impact: 'low',
          description: 'Optimize SVG icons and graphics'
        }
      ]
    },
    {
      category: 'Caching Strategy',
      items: [
        {
          name: 'Browser Caching',
          status: 'completed',
          impact: 'high',
          description: 'Configure proper cache headers for static assets'
        },
        {
          name: 'Service Worker',
          status: 'pending',
          impact: 'medium',
          description: 'Implement offline caching with service workers'
        },
        {
          name: 'API Response Caching',
          status: 'completed',
          impact: 'medium',
          description: 'Cache API responses to reduce server load'
        }
      ]
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
    }
  };

  const getOptimizationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[impact as keyof typeof colors]}>{impact} impact</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Optimization Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metrics">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
              <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceMetrics.map(metric => (
                  <Card key={metric.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{metric.name}</h3>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Score</span>
                          <span className={`font-bold text-lg ${getScoreColor(metric.score)}`}>
                            {metric.score}
                          </span>
                        </div>
                        <Progress value={metric.score} className="h-2" />
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {metric.description}
                      </p>

                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Suggestions:</span>
                        {metric.suggestions.map((suggestion, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Device Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Mobile</div>
                      <div className="text-2xl font-bold text-green-600">85</div>
                      <div className="text-sm text-muted-foreground">Performance Score</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Monitor className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium">Desktop</div>
                      <div className="text-2xl font-bold text-green-600">94</div>
                      <div className="text-sm text-muted-foreground">Performance Score</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="font-medium">SEO</div>
                      <div className="text-2xl font-bold text-green-600">96</div>
                      <div className="text-sm text-muted-foreground">SEO Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimizations" className="space-y-4">
              {optimizationStatus.map(category => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="text-base">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map(item => (
                        <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getOptimizationStatusIcon(item.status)}
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getImpactBadge(item.impact)}
                            <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                              {item.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="h-4 w-4" />
                      High Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Implement Image Lazy Loading</div>
                      <div className="text-sm text-muted-foreground">
                        Load images only when they're visible in the viewport
                      </div>
                      <Badge className="mt-2 bg-red-100 text-red-800">High Impact</Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Optimize Bundle Size</div>
                      <div className="text-sm text-muted-foreground">
                        Further reduce JavaScript bundle size through code splitting
                      </div>
                      <Badge className="mt-2 bg-red-100 text-red-800">High Impact</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="h-4 w-4" />
                      Medium Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Database Query Optimization</div>
                      <div className="text-sm text-muted-foreground">
                        Optimize slow database queries and add proper indexing
                      </div>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800">Medium Impact</Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">API Response Compression</div>
                      <div className="text-sm text-muted-foreground">
                        Enable gzip compression for API responses
                      </div>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800">Medium Impact</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Frontend Optimizations</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use React.memo for expensive components</li>
                        <li>• Implement virtual scrolling for large lists</li>
                        <li>• Optimize CSS delivery and remove unused styles</li>
                        <li>• Use modern image formats (WebP, AVIF)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Backend Optimizations</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Implement database connection pooling</li>
                        <li>• Use CDN for static asset delivery</li>
                        <li>• Enable server-side caching strategies</li>
                        <li>• Optimize API endpoint response times</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimization;