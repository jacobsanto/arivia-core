import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  TestTube, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { EnhancedCleaningRule } from '@/hooks/useAdvancedCleaningSystem';

interface RuleTestingPanelProps {
  rules: EnhancedCleaningRule[];
  onClose: () => void;
  onTest: (ruleId: string, testData: any) => Promise<boolean>;
}

interface TestBooking {
  stay_duration: number;
  guest_count: number;
  checkout_time: string;
  checkin_time: string;
  property_type: string;
  booking_source: string;
}

interface TestResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  executionTime: number;
  error?: string;
}

export const RuleTestingPanel: React.FC<RuleTestingPanelProps> = ({
  rules,
  onClose,
  onTest
}) => {
  const [selectedRule, setSelectedRule] = useState<string>('');
  const [testBooking, setTestBooking] = useState<TestBooking>({
    stay_duration: 3,
    guest_count: 2,
    checkout_time: '11:00',
    checkin_time: '15:00',
    property_type: 'apartment',
    booking_source: 'airbnb'
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [bulkTesting, setBulkTesting] = useState(false);

  const handleSingleTest = async () => {
    if (!selectedRule) return;
    
    setIsRunningTest(true);
    const startTime = Date.now();
    
    try {
      const rule = rules.find(r => r.id === selectedRule);
      if (!rule) return;
      
      const result = await onTest(selectedRule, testBooking);
      const executionTime = Date.now() - startTime;
      
      const testResult: TestResult = {
        ruleId: selectedRule,
        ruleName: rule.rule_name,
        passed: result,
        executionTime
      };
      
      setTestResults([testResult, ...testResults]);
    } catch (error) {
      const rule = rules.find(r => r.id === selectedRule);
      const testResult: TestResult = {
        ruleId: selectedRule,
        ruleName: rule?.rule_name || 'Unknown Rule',
        passed: false,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setTestResults([testResult, ...testResults]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleBulkTest = async () => {
    setBulkTesting(true);
    const newResults: TestResult[] = [];
    
    for (const rule of rules.filter(r => r.is_active)) {
      const startTime = Date.now();
      
      try {
        const result = await onTest(rule.id, testBooking);
        const executionTime = Date.now() - startTime;
        
        newResults.push({
          ruleId: rule.id,
          ruleName: rule.rule_name,
          passed: result,
          executionTime
        });
      } catch (error) {
        newResults.push({
          ruleId: rule.id,
          ruleName: rule.rule_name,
          passed: false,
          executionTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setTestResults([...newResults, ...testResults]);
    setBulkTesting(false);
  };

  const presetScenarios = [
    {
      name: 'Short Weekend Stay',
      data: { stay_duration: 2, guest_count: 2, checkout_time: '11:00', checkin_time: '16:00', property_type: 'apartment', booking_source: 'airbnb' }
    },
    {
      name: 'Extended Business Trip',
      data: { stay_duration: 14, guest_count: 1, checkout_time: '10:00', checkin_time: '14:00', property_type: 'studio', booking_source: 'booking.com' }
    },
    {
      name: 'Family Vacation',
      data: { stay_duration: 7, guest_count: 6, checkout_time: '12:00', checkin_time: '15:00', property_type: 'house', booking_source: 'vrbo' }
    },
    {
      name: 'Late Checkout',
      data: { stay_duration: 3, guest_count: 4, checkout_time: '14:00', checkin_time: '15:00', property_type: 'apartment', booking_source: 'direct' }
    }
  ];

  const activeRules = rules.filter(r => r.is_active);
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = testResults.filter(r => !r.passed).length;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Rule Testing Panel
          </DialogTitle>
          <DialogDescription>
            Test cleaning rules against booking scenarios to verify logic and performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Booking Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Booking Data</CardTitle>
                <CardDescription>
                  Configure booking parameters for testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stay_duration">Stay Duration (nights)</Label>
                    <Input
                      id="stay_duration"
                      type="number"
                      min="1"
                      value={testBooking.stay_duration}
                      onChange={(e) => setTestBooking(prev => ({ 
                        ...prev, 
                        stay_duration: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest_count">Guest Count</Label>
                    <Input
                      id="guest_count"
                      type="number"
                      min="1"
                      value={testBooking.guest_count}
                      onChange={(e) => setTestBooking(prev => ({ 
                        ...prev, 
                        guest_count: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin_time">Check-in Time</Label>
                    <Input
                      id="checkin_time"
                      type="time"
                      value={testBooking.checkin_time}
                      onChange={(e) => setTestBooking(prev => ({ 
                        ...prev, 
                        checkin_time: e.target.value 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout_time">Checkout Time</Label>
                    <Input
                      id="checkout_time"
                      type="time"
                      value={testBooking.checkout_time}
                      onChange={(e) => setTestBooking(prev => ({ 
                        ...prev, 
                        checkout_time: e.target.value 
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select
                      value={testBooking.property_type}
                      onValueChange={(value) => setTestBooking(prev => ({ 
                        ...prev, 
                        property_type: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="booking_source">Booking Source</Label>
                    <Select
                      value={testBooking.booking_source}
                      onValueChange={(value) => setTestBooking(prev => ({ 
                        ...prev, 
                        booking_source: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airbnb">Airbnb</SelectItem>
                        <SelectItem value="booking.com">Booking.com</SelectItem>
                        <SelectItem value="vrbo">VRBO</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preset Scenarios */}
                <div>
                  <Label>Quick Scenarios</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {presetScenarios.map((scenario) => (
                      <Button
                        key={scenario.name}
                        variant="outline"
                        size="sm"
                        onClick={() => setTestBooking(scenario.data)}
                        className="text-left justify-start"
                      >
                        {scenario.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Controls</CardTitle>
                <CardDescription>
                  Run tests against individual rules or all active rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Single Rule Test */}
                <div>
                  <Label htmlFor="rule_select">Test Single Rule</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedRule} onValueChange={setSelectedRule}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a rule to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeRules.map(rule => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.rule_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleSingleTest}
                      disabled={!selectedRule || isRunningTest}
                    >
                      {isRunningTest ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Bulk Test */}
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleBulkTest}
                    disabled={bulkTesting || activeRules.length === 0}
                    className="w-full"
                    variant="outline"
                  >
                    {bulkTesting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Testing All Rules...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test All Active Rules ({activeRules.length})
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Stats */}
                {testResults.length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{passedTests}</div>
                        <div className="text-xs text-green-600">Passed</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">{failedTests}</div>
                        <div className="text-xs text-red-600">Failed</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{testResults.length}</div>
                        <div className="text-xs text-blue-600">Total</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
                <CardDescription>
                  Latest test results with execution details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={`${result.ruleId}-${index}`}
                    className={`p-4 rounded-lg border ${
                      result.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">{result.ruleName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.executionTime}ms
                        </Badge>
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};