import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, TrendingUp, Receipt } from 'lucide-react';

export const PaymentIntegrations = () => {
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [autoRefunds, setAutoRefunds] = useState(true);

  const paymentProviders = [
    {
      name: "Stripe",
      status: "connected",
      type: "Credit Cards & Bank Transfers",
      transactions: "1,247",
      revenue: "€284,650",
      fees: "€8,539",
      health: 99.8,
      lastTransaction: "2 minutes ago"
    },
    {
      name: "PayPal",
      status: "disconnected", 
      type: "Digital Wallet",
      transactions: "0",
      revenue: "€0",
      fees: "€0",
      health: 0,
      lastTransaction: "Never"
    },
    {
      name: "Square",
      status: "available",
      type: "Point of Sale",
      transactions: "N/A",
      revenue: "N/A", 
      fees: "N/A",
      health: 0,
      lastTransaction: "N/A"
    },
    {
      name: "Revolut Business",
      status: "available",
      type: "Multi-currency",
      transactions: "N/A",
      revenue: "N/A",
      fees: "N/A", 
      health: 0,
      lastTransaction: "N/A"
    }
  ];

  const recentTransactions = [
    {
      id: "txn_1234567890",
      amount: "€450.00",
      currency: "EUR",
      guest: "Sarah Johnson",
      property: "Villa Aurora",
      method: "Stripe",
      status: "completed",
      type: "payment",
      timestamp: "2 minutes ago"
    },
    {
      id: "txn_0987654321",
      amount: "€1,200.00", 
      currency: "EUR",
      guest: "Mike Chen",
      property: "Villa Serenity",
      method: "Stripe",
      status: "completed",
      type: "payment",
      timestamp: "15 minutes ago"
    },
    {
      id: "ref_1122334455",
      amount: "-€300.00",
      currency: "EUR", 
      guest: "Emma Wilson",
      property: "Villa Paradise",
      method: "Stripe",
      status: "completed",
      type: "refund",
      timestamp: "1 hour ago"
    },
    {
      id: "txn_5566778899",
      amount: "€875.50",
      currency: "EUR",
      guest: "David Brown",
      property: "Villa Sunset", 
      method: "Stripe",
      status: "pending",
      type: "payment",
      timestamp: "2 hours ago"
    }
  ];

  const paymentAnalytics = [
    {
      metric: "Total Revenue",
      value: "€284,650",
      change: "+12.3%",
      period: "This month"
    },
    {
      metric: "Transaction Fees",
      value: "€8,539", 
      change: "+2.1%",
      period: "This month"
    },
    {
      metric: "Success Rate",
      value: "98.7%",
      change: "+0.3%",
      period: "Last 30 days"
    },
    {
      metric: "Avg Transaction",
      value: "€628.50",
      change: "-1.2%",
      period: "This month"
    }
  ];

  const paymentMethods = [
    {
      type: "Credit/Debit Cards",
      percentage: 78.5,
      transactions: 981,
      revenue: "€223,450"
    },
    {
      type: "Bank Transfers",
      percentage: 15.2,
      transactions: 190,
      revenue: "€43,290"
    },
    {
      type: "Digital Wallets",
      percentage: 4.8,
      transactions: 60,
      revenue: "€13,680"
    },
    {
      type: "Alternative Methods",
      percentage: 1.5,
      transactions: 16,
      revenue: "€4,230"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-muted-foreground';
      case 'available': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'secondary';
      case 'available': return 'outline';
      default: return 'outline';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'refund': return <Receipt className="h-4 w-4 text-warning" />;
      default: return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const connectProvider = (provider: string) => {
    console.log('Connecting payment provider:', provider);
  };

  const viewTransaction = (transactionId: string) => {
    console.log('Viewing transaction:', transactionId);
  };

  return (
    <div className="space-y-6">
      {/* Payment Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentAnalytics.map((analytic, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{analytic.metric}</p>
                <p className="text-2xl font-bold text-foreground">{analytic.value}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className={`text-xs ${analytic.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                    {analytic.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{analytic.period}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Payment Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentProviders.map((provider, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${getStatusColor(provider.status)}`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{provider.name}</h4>
                      <Badge variant={getStatusBadge(provider.status) as any}>
                        {provider.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.type}</p>
                    {provider.status === 'connected' && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>Transactions: {provider.transactions}</span>
                        <span>Revenue: {provider.revenue}</span>
                        <span>Fees: {provider.fees}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {provider.status === 'connected' && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{provider.health}%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                  )}
                  {provider.status === 'available' || provider.status === 'disconnected' ? (
                    <Button size="sm" variant="outline" onClick={() => connectProvider(provider.name)}>
                      Connect
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Processing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Stripe Integration</h4>
                <p className="text-sm text-muted-foreground">Primary payment processor</p>
              </div>
              <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">PayPal Backup</h4>
                <p className="text-sm text-muted-foreground">Alternative payment method</p>
              </div>
              <Switch checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto Refunds</h4>
                <p className="text-sm text-muted-foreground">Process refunds automatically</p>
              </div>
              <Switch checked={autoRefunds} onCheckedChange={setAutoRefunds} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" value="EUR" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook">Payment Webhook URL</Label>
              <Input id="webhook" placeholder="https://your-domain.com/webhooks/payments" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{transaction.amount}</span>
                        <Badge variant="outline" className="text-xs">{transaction.method}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{transaction.guest} • {transaction.property}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.timestamp}</span>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => viewTransaction(transaction.id)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{method.type}</span>
                  <span>{method.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{method.transactions} transactions</span>
                  <span>{method.revenue}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Payment Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="font-medium">PCI DSS Compliant</div>
              <div className="text-sm text-muted-foreground">Level 1 Certification</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="font-medium">SSL Encryption</div>
              <div className="text-sm text-muted-foreground">256-bit Security</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="font-medium">Fraud Protection</div>
              <div className="text-sm text-muted-foreground">AI-powered Detection</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};