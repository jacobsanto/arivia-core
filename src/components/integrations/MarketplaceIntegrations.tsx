import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Store, Globe, TrendingUp, Calendar, Star, DollarSign, Users } from 'lucide-react';

export const MarketplaceIntegrations = () => {
  const [airbnbEnabled, setAirbnbEnabled] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [vrboEnabled, setVrboEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const connectMarketplace = (marketplaceName: string) => {
    console.log(`Connecting to ${marketplaceName}...`);
    // Here you would implement the actual connection logic
  };

  const configureMarketplace = (marketplaceName: string) => {
    console.log(`Configuring ${marketplaceName}...`);
    // Here you would implement the configuration logic
  };

  const marketplaces = [
    {
      name: "Airbnb",
      status: "available",
      type: "Vacation Rental Platform",
      listings: "0",
      bookings: "0",
      revenue: "€0",
      commission: "3-5%",
      health: 0,
      lastSync: "Never",
      features: ["Instant Book", "Host Protection", "Global Reach"]
    },
    {
      name: "Booking.com",
      status: "available",
      type: "Travel Booking Platform", 
      listings: "0",
      bookings: "0",
      revenue: "€0",
      commission: "15%",
      health: 0,
      lastSync: "Never",
      features: ["Free Cancellation", "Verified Reviews", "24/7 Support"]
    },
    {
      name: "VRBO/Expedia",
      status: "available",
      type: "Vacation Rental by Owner",
      listings: "0", 
      bookings: "0",
      revenue: "€0",
      commission: "5-8%",
      health: 0,
      lastSync: "Never",
      features: ["Whole Home Focus", "Payment Protection", "Travel Insurance"]
    },
    {
      name: "Agoda",
      status: "coming_soon",
      type: "Asian Market Leader",
      listings: "N/A",
      bookings: "N/A", 
      revenue: "N/A",
      commission: "15-18%",
      health: 0,
      lastSync: "N/A",
      features: ["Asian Market", "Multi-language", "Local Payment Methods"]
    }
  ];

  const channelPerformance = [
    {
      channel: "Direct Bookings",
      bookings: 485,
      revenue: "€142,650",
      commission: "€0",
      conversion: "12.3%",
      avgStay: "4.2 nights"
    },
    {
      channel: "Property Platform",
      bookings: 0,
      revenue: "€0", 
      commission: "€0",
      conversion: "0%",
      avgStay: "0 nights"
    },
    {
      channel: "Potential Airbnb",
      bookings: "Est. 320",
      revenue: "Est. €98,000",
      commission: "Est. €4,900",
      conversion: "Est. 6.5%", 
      avgStay: "Est. 3.5 nights"
    },
    {
      channel: "Potential Booking.com",
      bookings: "Est. 280",
      revenue: "Est. €89,000",
      commission: "Est. €13,350",
      conversion: "Est. 5.8%",
      avgStay: "Est. 4.1 nights"
    }
  ];

  const marketInsights = [
    {
      metric: "Market Penetration",
      value: "35%",
      description: "Of available platforms connected",
      trend: "stable"
    },
    {
      metric: "Channel Diversification",
      value: "Low Risk", 
      description: "Currently dependent on 2 channels",
      trend: "warning"
    },
    {
      metric: "Revenue Potential",
      value: "+€187K",
      description: "Estimated annual increase with all platforms",
      trend: "positive"
    },
    {
      metric: "Booking Growth",
      value: "+48%",
      description: "Potential increase in total bookings",
      trend: "positive"
    }
  ];

  const listingOptimization = [
    {
      property: "Villa Aurora",
      currentRating: 4.8,
      currentBookings: 89,
      potentialIncrease: "+35%",
      recommendations: ["Add more photos", "Update amenities list", "Improve description"]
    },
    {
      property: "Villa Serenity", 
      currentRating: 4.9,
      currentBookings: 95,
      potentialIncrease: "+28%",
      recommendations: ["Virtual tour", "Seasonal pricing", "Local attractions guide"]
    },
    {
      property: "Villa Paradise",
      currentRating: 4.7,
      currentBookings: 82,
      potentialIncrease: "+42%", 
      recommendations: ["Professional photos", "Competitive pricing", "Response time improvement"]
    },
    {
      property: "Villa Sunset",
      currentRating: 4.8,
      currentBookings: 91,
      potentialIncrease: "+31%",
      recommendations: ["Add pool photos", "Update calendar", "Guest communication templates"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'available': return 'text-info';
      case 'coming_soon': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'available': return 'outline';
      case 'coming_soon': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-success';
      case 'warning': return 'text-warning';
      case 'stable': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };


  const optimizeListing = (property: string) => {
    console.log('Optimizing listing for:', property);
  };

  return (
    <div className="space-y-6">
      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketInsights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{insight.metric}</p>
                <p className={`text-2xl font-bold ${getTrendColor(insight.trend)}`}>{insight.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Marketplaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            Marketplace Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketplaces.map((marketplace, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${getStatusColor(marketplace.status)}`}>
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{marketplace.name}</h4>
                      <Badge variant={getStatusBadge(marketplace.status) as any}>
                        {marketplace.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{marketplace.type}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Commission: {marketplace.commission}</span>
                      {marketplace.status === 'connected' && (
                        <>
                          <span>Listings: {marketplace.listings}</span>
                          <span>Revenue: {marketplace.revenue}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {marketplace.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {marketplace.status === 'connected' && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{marketplace.health}%</div>
                      <div className="text-xs text-muted-foreground">Health</div>
                    </div>
                  )}
                  {marketplace.status === 'available' ? (
                    <Button size="sm" variant="outline" onClick={() => connectMarketplace(marketplace.name)}>
                      Connect
                    </Button>
                  ) : marketplace.status === 'coming_soon' ? (
                    <Button size="sm" variant="outline" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => configureMarketplace(marketplace.name)}>
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Channel Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelPerformance.map((channel, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{channel.channel}</h4>
                  <Badge variant={channel.channel.includes('Potential') ? 'secondary' : 'default'}>
                    {channel.channel.includes('Potential') ? 'Projection' : 'Active'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{channel.bookings}</div>
                    <div className="text-muted-foreground">Bookings</div>
                  </div>
                  <div>
                    <div className="font-medium">{channel.revenue}</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                  <div>
                    <div className="font-medium">{channel.commission}</div>
                    <div className="text-muted-foreground">Commission</div>
                  </div>
                  <div>
                    <div className="font-medium">{channel.conversion}</div>
                    <div className="text-muted-foreground">Conversion</div>
                  </div>
                  <div>
                    <div className="font-medium">{channel.avgStay}</div>
                    <div className="text-muted-foreground">Avg Stay</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Airbnb</h4>
                <p className="text-sm text-muted-foreground">Vacation rental platform</p>
              </div>
              <Switch checked={airbnbEnabled} onCheckedChange={setAirbnbEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Booking.com</h4>
                <p className="text-sm text-muted-foreground">Travel booking site</p>
              </div>
              <Switch checked={bookingEnabled} onCheckedChange={setBookingEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">VRBO</h4>
                <p className="text-sm text-muted-foreground">Vacation rental platform</p>
              </div>
              <Switch checked={vrboEnabled} onCheckedChange={setVrboEnabled} />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto Sync</h4>
                <p className="text-sm text-muted-foreground">Automatic calendar sync</p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultCheckIn">Default Check-in Time</Label>
              <Input id="defaultCheckIn" value="15:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCheckOut">Default Check-out Time</Label>
              <Input id="defaultCheckOut" value="11:00" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-muted-foreground" />
            Listing Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listingOptimization.map((listing, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-foreground">{listing.property}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{listing.currentRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {listing.currentBookings} bookings
                    </Badge>
                    <Badge variant="outline" className="text-xs text-success">
                      {listing.potentialIncrease} potential
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Optimization Recommendations:</h5>
                  <div className="flex flex-wrap gap-2">
                    {listing.recommendations.map((rec, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Impact: Potential {listing.potentialIncrease} increase in bookings
                  </div>
                  <Button size="sm" variant="outline" onClick={() => optimizeListing(listing.property)}>
                    Optimize Listing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            Revenue Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">€284,650</div>
              <div className="text-sm text-muted-foreground">Current Annual Revenue</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">€471,650</div>
              <div className="text-sm text-muted-foreground">Projected with All Platforms</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">+€187,000</div>
              <div className="text-sm text-muted-foreground">Additional Revenue Potential</div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h4 className="font-medium">Implementation Timeline</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Month 1: Airbnb Integration</span>
                <span className="text-sm text-success">+€8,200/month</span>
              </div>
              <Progress value={100} className="w-full h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Month 2: Booking.com Integration</span>
                <span className="text-sm text-success">+€7,400/month</span>
              </div>
              <Progress value={75} className="w-full h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Month 3: Listing Optimization</span>
                <span className="text-sm text-success">+€3,100/month</span>
              </div>
              <Progress value={25} className="w-full h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};