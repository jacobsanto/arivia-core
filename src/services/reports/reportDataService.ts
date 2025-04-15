
import { DateRange } from '@/components/reports/DateRangeSelector';
import { completionData, staffData, performanceByDayData } from '@/components/tasks/reporting/reportingData';
import { formatISO, parseISO, isWithinInterval } from 'date-fns';

// Define interfaces for our report data
export interface PropertyReportData {
  name: string;
  completed: number;
  rejected: number;
  approved: number;
}

export interface StaffReportData {
  name: string;
  completed: number;
  avgTime: number;
  rating: number;
}

export interface TimeAnalysisData {
  name: string;
  tasks: number;
  avgTime: number;
}

interface FilterOptions {
  dateRange: DateRange;
  property?: string;
}

class ReportDataService {
  // This would be replaced with actual API calls in a production app
  private propertyData = completionData;
  private staffData = staffData;
  private timeData = performanceByDayData;
  
  // Get property data filtered by date range
  async getPropertyData(filters: FilterOptions): Promise<PropertyReportData[]> {
    await this.simulateApiDelay();
    
    if (!filters.dateRange.from || !filters.dateRange.to) {
      return this.propertyData;
    }

    // In a real app, this would be an API call with date range parameters
    // For now, we'll simulate filtered data by randomly adjusting values based on the time period
    const dateKey = `${formatISO(filters.dateRange.from)}_${formatISO(filters.dateRange.to)}`;
    const seed = this.hashCode(dateKey);
    
    return this.propertyData.map(item => ({
      ...item,
      completed: this.adjustValue(item.completed, seed, 0.7, 1.3),
      rejected: this.adjustValue(item.rejected, seed + 1, 0.5, 1.5),
      approved: this.adjustValue(item.approved, seed + 2, 0.8, 1.2)
    }));
  }
  
  // Get staff data filtered by date range
  async getStaffData(filters: FilterOptions): Promise<StaffReportData[]> {
    await this.simulateApiDelay();
    
    if (!filters.dateRange.from || !filters.dateRange.to) {
      return this.staffData;
    }
    
    // Simulate filtered data
    const dateKey = `${formatISO(filters.dateRange.from)}_${formatISO(filters.dateRange.to)}`;
    const seed = this.hashCode(dateKey);
    
    return this.staffData.map(item => ({
      ...item,
      completed: this.adjustValue(item.completed, seed, 0.7, 1.3),
      avgTime: this.adjustValue(item.avgTime, seed + 1, 0.9, 1.1),
      rating: Math.min(5.0, Math.max(4.0, item.rating * (1 + (this.pseudoRandom(seed + 2) - 0.5) * 0.1)))
    }));
  }
  
  // Get time analysis data filtered by date range
  async getTimeAnalysisData(filters: FilterOptions): Promise<TimeAnalysisData[]> {
    await this.simulateApiDelay();
    
    if (!filters.dateRange.from || !filters.dateRange.to) {
      return this.timeData;
    }
    
    // Simulate filtered data
    const dateKey = `${formatISO(filters.dateRange.from)}_${formatISO(filters.dateRange.to)}`;
    const seed = this.hashCode(dateKey);
    
    return this.timeData.map(item => ({
      ...item,
      tasks: this.adjustValue(item.tasks, seed, 0.6, 1.4),
      avgTime: this.adjustValue(item.avgTime, seed + 1, 0.8, 1.2)
    }));
  }
  
  // Helper method to simulate API delay
  private async simulateApiDelay() {
    return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  }
  
  // Simple hash code function for deterministic "random" values
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  
  // Generate a pseudo-random number between 0 and 1 based on a seed
  private pseudoRandom(seed: number): number {
    return ((seed * 9301 + 49297) % 233280) / 233280;
  }
  
  // Adjust a value by a random factor within the given range
  private adjustValue(value: number, seed: number, minFactor: number, maxFactor: number): number {
    const factor = minFactor + this.pseudoRandom(seed) * (maxFactor - minFactor);
    return Math.round(value * factor);
  }
}

export const reportDataService = new ReportDataService();
