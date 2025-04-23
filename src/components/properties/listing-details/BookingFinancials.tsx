
import React from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface BookingFinancialsProps {
  booking: any;
  isExpanded: boolean;
}

export const BookingFinancials: React.FC<BookingFinancialsProps> = ({ booking, isExpanded }) => {
  const rawData = booking.raw_data || {};
  const money = rawData.money || {};
  
  const formatAmount = (amount: number, currency: string = 'EUR') => {
    if (amount === undefined || amount === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };
  
  const netAmount = money.netAmount;
  const channelFee = money.channelFee;
  const profit = netAmount - (channelFee || 0);
  
  // Calculate profit margin
  const margin = netAmount > 0 
    ? ((profit / netAmount) * 100).toFixed(1) + '%' 
    : '0%';
  
  // Basic financial info (always shown)
  const basicFinancialInfo = (
    <div className="flex items-center">
      <DollarSign className="h-4 w-4 mr-2" />
      <span>{formatAmount(netAmount, money.currency)}</span>
    </div>
  );
  
  // Detailed financial info (shown only when expanded)
  const detailedFinancialInfo = isExpanded && (
    <div className="mt-3 space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <CreditCard className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Channel Fee:</span>
        </div>
        <div className="text-right">
          {formatAmount(channelFee, money.currency)}
        </div>
        
        <div className="flex items-center">
          <TrendingUp className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Profit:</span>
        </div>
        <div className="text-right font-medium">
          {formatAmount(profit, money.currency)}
        </div>
        
        <div className="flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Margin:</span>
        </div>
        <div className="text-right">
          {margin}
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {basicFinancialInfo}
      {detailedFinancialInfo}
    </>
  );
};
