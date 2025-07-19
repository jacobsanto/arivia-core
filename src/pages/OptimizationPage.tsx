import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceOptimization from '@/components/optimization/PerformanceOptimization';
import SEOOptimization from '@/components/optimization/SEOOptimization';
import QualityAssurance from '@/components/qa/QualityAssurance';

const OptimizationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">System Optimization</h1>
          <p className="text-muted-foreground mt-2">
            Performance optimization, SEO management, and quality assurance
          </p>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="seo">SEO Optimization</TabsTrigger>
            <TabsTrigger value="qa">Quality Assurance</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <PerformanceOptimization />
          </TabsContent>

          <TabsContent value="seo">
            <SEOOptimization />
          </TabsContent>

          <TabsContent value="qa">
            <QualityAssurance />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OptimizationPage;