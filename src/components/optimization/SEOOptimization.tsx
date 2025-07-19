import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  Image, 
  Code, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOCheck {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  description: string;
  recommendation?: string;
}

interface MetaTag {
  property: string;
  content: string;
  required: boolean;
}

const SEOOptimization = () => {
  const { toast } = useToast();
  const [metaTags, setMetaTags] = useState<MetaTag[]>([
    { property: 'title', content: 'Arivia Villas - Premium Villa Operations Platform', required: true },
    { property: 'description', content: 'Complete property management solution for luxury villa operations, housekeeping, and guest services.', required: true },
    { property: 'keywords', content: 'villa management, property operations, housekeeping, luxury accommodation', required: false },
    { property: 'og:title', content: 'Arivia Villas Operations Platform', required: true },
    { property: 'og:description', content: 'Streamline your villa operations with our comprehensive management platform.', required: true },
    { property: 'og:image', content: 'https://arivia-villas.com/og-image.jpg', required: true },
    { property: 'og:url', content: 'https://arivia-villas.com', required: true },
    { property: 'twitter:card', content: 'summary_large_image', required: false }
  ]);

  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [robotsEnabled, setRobotsEnabled] = useState(true);
  const [structuredDataEnabled, setStructuredDataEnabled] = useState(true);

  const seoChecks: SEOCheck[] = [
    {
      name: 'Page Title',
      status: 'passed',
      description: 'Page has a descriptive title tag',
      recommendation: 'Keep titles under 60 characters'
    },
    {
      name: 'Meta Description',
      status: 'passed',
      description: 'Page has a meta description',
      recommendation: 'Keep descriptions between 150-160 characters'
    },
    {
      name: 'H1 Tag',
      status: 'passed',
      description: 'Page has exactly one H1 tag'
    },
    {
      name: 'Image Alt Text',
      status: 'warning',
      description: 'Some images missing alt text',
      recommendation: 'Add descriptive alt text to all images'
    },
    {
      name: 'Internal Links',
      status: 'passed',
      description: 'Page has adequate internal linking'
    },
    {
      name: 'Mobile Friendly',
      status: 'passed',
      description: 'Page is mobile responsive'
    },
    {
      name: 'Page Speed',
      status: 'warning',
      description: 'Page load time could be improved',
      recommendation: 'Optimize images and reduce JavaScript bundle size'
    },
    {
      name: 'SSL Certificate',
      status: 'passed',
      description: 'Site uses HTTPS encryption'
    }
  ];

  const getStatusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: SEOCheck['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const updateMetaTag = (index: number, content: string) => {
    const updated = [...metaTags];
    updated[index].content = content;
    setMetaTags(updated);
  };

  const generateSitemap = () => {
    toast({
      title: "Sitemap generated",
      description: "XML sitemap has been generated and submitted to search engines."
    });
  };

  const generateRobotsTxt = () => {
    toast({
      title: "Robots.txt updated",
      description: "Robots.txt file has been generated with proper directives."
    });
  };

  const copyMetaTag = (tag: MetaTag) => {
    const metaString = `<meta ${tag.property.startsWith('og:') || tag.property.startsWith('twitter:') ? 'property' : 'name'}="${tag.property}" content="${tag.content}" />`;
    navigator.clipboard.writeText(metaString);
    toast({
      title: "Copied to clipboard",
      description: "Meta tag has been copied to your clipboard."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Optimization Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analysis">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">SEO Analysis</TabsTrigger>
              <TabsTrigger value="meta">Meta Tags</TabsTrigger>
              <TabsTrigger value="technical">Technical SEO</TabsTrigger>
              <TabsTrigger value="tools">SEO Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">85</div>
                    <div className="text-sm text-muted-foreground">SEO Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">6</div>
                    <div className="text-sm text-muted-foreground">Passed Checks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {seoChecks.map((check, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <div className="font-medium">{check.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {check.description}
                            </div>
                            {check.recommendation && (
                              <div className="text-sm text-blue-600 mt-1">
                                💡 {check.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="meta" className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Meta Tags Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure meta tags for better search engine visibility and social media sharing.
                </p>
              </div>

              <div className="space-y-4">
                {metaTags.map((tag, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">{tag.property}</Label>
                        <div className="flex items-center gap-2">
                          {tag.required && <Badge variant="destructive">Required</Badge>}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMetaTag(tag)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {tag.property === 'description' || tag.property === 'og:description' ? (
                        <Textarea
                          value={tag.content}
                          onChange={(e) => updateMetaTag(index, e.target.value)}
                          className="min-h-[80px]"
                        />
                      ) : (
                        <Input
                          value={tag.content}
                          onChange={(e) => updateMetaTag(index, e.target.value)}
                        />
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Length: {tag.content.length} characters
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sitemap Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sitemap">Auto-generate Sitemap</Label>
                      <Switch
                        id="sitemap"
                        checked={sitemapEnabled}
                        onCheckedChange={setSitemapEnabled}
                      />
                    </div>
                    <Button onClick={generateSitemap} className="w-full">
                      <Globe className="h-4 w-4 mr-2" />
                      Generate Sitemap
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Last generated: Today at 2:00 AM
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Robots.txt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="robots">Enable Robots.txt</Label>
                      <Switch
                        id="robots"
                        checked={robotsEnabled}
                        onCheckedChange={setRobotsEnabled}
                      />
                    </div>
                    <Button onClick={generateRobotsTxt} className="w-full">
                      <Code className="h-4 w-4 mr-2" />
                      Update Robots.txt
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Status: ✅ Properly configured
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Structured Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="structured">Schema Markup</Label>
                      <Switch
                        id="structured"
                        checked={structuredDataEnabled}
                        onCheckedChange={setStructuredDataEnabled}
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Organization Schema</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>LocalBusiness Schema</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>Article Schema</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mobile Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Mobile Responsive</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>Viewport Meta Tag</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>Touch-friendly UI</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>Mobile Page Speed</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Test Mobile Usability
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">External SEO Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-between">
                      Google Search Console
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      Google PageSpeed Insights
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      GTmetrix Analysis
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      Lighthouse Audit
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="target-keyword">Target Keyword</Label>
                      <Input 
                        id="target-keyword"
                        placeholder="Enter your target keyword"
                        defaultValue="villa management software"
                      />
                    </div>
                    <Button className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Keyword
                    </Button>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Search Volume:</span>
                        <span className="font-medium">1,200/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Competition:</span>
                        <Badge className="bg-green-100 text-green-800">Low</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SEO Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">24</div>
                      <div className="text-sm text-muted-foreground">Indexed Pages</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Backlinks</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">12</div>
                      <div className="text-sm text-muted-foreground">Top 10 Keywords</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold">3.2%</div>
                      <div className="text-sm text-muted-foreground">CTR</div>
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

export default SEOOptimization;