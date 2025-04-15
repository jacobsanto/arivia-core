import { DateRange } from '@/components/reports/DateRangeSelector';
import { isWithinInterval, parseISO, startOfDay } from 'date-fns';

// Define interfaces for our report data
export interface PropertyReportData {
  name: string;
  completed: number;
  rejected: number;
  approved: number;
  date: string; // ISO string for the date
}

export interface StaffReportData {
  name: string;
  completed: number;
  avgTime: number;
  rating: number;
  dates: string[]; // ISO strings for dates of activity
}

export interface TimeAnalysisData {
  name: string; // Day of week
  tasks: number;
  avgTime: number;
  date: string; // ISO string for the date
}

interface FilterOptions {
  dateRange: DateRange;
  property?: string;
}

// Sample data with proper dates
const generatePropertyData = () => {
  // Generate data for the last 365 days
  const now = new Date();
  const data: PropertyReportData[] = [];
  
  const properties = ['Villa Caldera', 'Villa Sunset', 'Villa Oceana', 'Villa Paradiso', 'Villa Azure'];
  
  // Create sample data for each day in the past year for each property
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    properties.forEach(property => {
      // Generate more tasks for more recent dates to show realistic patterns
      const factor = Math.max(0.1, 1 - (i / 365)); // Higher factor for more recent dates
      const baseCompleted = Math.floor(2 + Math.random() * 3); // 2-4 tasks per day
      const completed = Math.round(baseCompleted * factor);
      const rejected = Math.round(Math.random() * Math.min(2, completed * 0.3)); // 0-30% rejected
      const approved = Math.max(0, completed - rejected);
      
      data.push({
        name: property,
        completed,
        rejected,
        approved,
        date: date.toISOString(),
      });
    });
  }
  
  return data;
};

const generateStaffData = () => {
  const now = new Date();
  const data: StaffReportData[] = [];
  
  const staff = ['Maria K.', 'Stefan M.', 'Ana R.', 'Thomas L.', 'Julia P.'];
  
  // Create aggregate staff data with activity dates
  staff.forEach(name => {
    const taskDates: string[] = [];
    
    // Generate random dates of activity for the past year
    for (let i = 0; i < 365; i++) {
      // Not every staff works every day
      if (Math.random() > 0.3) { // 70% chance of working on a given day
        const date = new Date();
        date.setDate(now.getDate() - i);
        taskDates.push(date.toISOString());
      }
    }
    
    // Calculate metrics based on their activity dates
    const completed = taskDates.length * (1 + Math.floor(Math.random() * 3)); // 1-3 tasks per day
    const avgTime = 60 + Math.floor(Math.random() * 20); // 60-80 minutes
    const rating = 4.5 + (Math.random() * 0.5); // 4.5-5.0 rating
    
    data.push({
      name,
      completed,
      avgTime,
      rating,
      dates: taskDates
    });
  });
  
  return data;
};

const generateTimeAnalysisData = () => {
  const now = new Date();
  const data: TimeAnalysisData[] = [];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Create data for each day in the past year
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    const dayOfWeek = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
    
    // Weekend days have more tasks
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseTasks = isWeekend ? 
      Math.floor(5 + Math.random() * 4) : // 5-8 tasks on weekends
      Math.floor(2 + Math.random() * 4);  // 2-5 tasks on weekdays
    
    // Newer dates have more tasks (seasonal pattern)
    const seasonalFactor = Math.max(0.5, 1 - (i / 365)); // Higher factor for more recent dates
    const tasks = Math.round(baseTasks * seasonalFactor);
    
    // Weekend cleanings take longer
    const avgTime = isWeekend ? 
      70 + Math.floor(Math.random() * 15) : // 70-85 minutes on weekends
      65 + Math.floor(Math.random() * 10);  // 65-75 minutes on weekdays
    
    data.push({
      name: dayOfWeek,
      tasks,
      avgTime,
      date: date.toISOString()
    });
  }
  
  return data;
};

class ReportDataService {
  // Generate data with proper dates
  private propertyData = generatePropertyData();
  private staffData = generateStaffData();
  private timeData = generateTimeAnalysisData();
  
  // Get property data filtered by date range
  async getPropertyData(filters: FilterOptions): Promise<PropertyReportData[]> {
    await this.simulateApiDelay();
    
    if (!filters.dateRange.from || !filters.dateRange.to) {
      return this.aggregatePropertyData(this.propertyData);
    }

    // Filter data by date range
    const filteredData = this.propertyData.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, {
        start: startOfDay(filters.dateRange.from!),
        end: startOfDay(filters.dateRange.to!)
      });
    });
    
    // Aggregate data by property name
    return this.aggregatePropertyData(filteredData);
  }
  
  // Aggregate property data
  private aggregatePropertyData(data: PropertyReportData[]): PropertyReportData[] {
    const aggregatedMap = new Map<string, PropertyReportData>();
    
    data.forEach(item => {
      if (!aggregatedMap.has(item.name)) {
        aggregatedMap.set(item.name, {
          name: item.name,
          completed: 0,
          rejected: 0,
          approved: 0,
          date: ''
        });
      }
      
      const existing = aggregatedMap.get(item.name)!;
      existing.completed += item.completed;
      existing.rejected += item.rejected;
      existing.approved += item.approved;
    });
    
    return Array.from(aggregatedMap.values());
  }
  
  // Get staff data filtered by date range
  async getStaffData(filters: FilterOptions): Promise<StaffReportData[]> {
    await this.simulateApiDelay();
    
    if (!filters.dateRange.from || !filters.dateRange.to) {
      return this.staffData;
    }
    
    // Filter staff data by date range
    return this.staffData.map(staff => {
      // Filter dates within the range
      const filteredDates = staff.dates.filter(dateStr => {
        const itemDate = parseISO(dateStr);
        return isWithinInterval(itemDate, {
          start: startOfDay(filters.dateRange.from!),
          end: startOfDay(filters.dateRange.to!)
        });
      });
      
      // Adjust completed tasks based on filtered dates
      const completedTasksPerDay = staff.completed / staff.dates.length;
      const newCompleted = Math.round(filteredDates.length * completedTasksPerDay);
      
      return {
        ...staff,
        dates: filteredDates,
        completed: newCompleted,
        // Rating and avgTime remain the same for simplicity
      };
    });
  }
  
  // Get time analysis data filtered by date range
  async getTimeAnalysisData(filters: FilterOptions): Promise<TimeAnalysisData[]> {
    await this.simulateApiDelay();
    
    if (!filters.dateRange.from || !filters.dateRange.to) {
      return this.aggregateTimeData(this.timeData);
    }
    
    // Filter time data by date range
    const filteredData = this.timeData.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, {
        start: startOfDay(filters.dateRange.from!),
        end: startOfDay(filters.dateRange.to!)
      });
    });
    
    // Aggregate time data by day of week
    return this.aggregateTimeData(filteredData);
  }
  
  // Aggregate time data by day of week
  private aggregateTimeData(data: TimeAnalysisData[]): TimeAnalysisData[] {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const aggregated: Record<string, { totalTasks: number, totalTime: number, count: number }> = {};
    
    // Initialize aggregation object
    daysOfWeek.forEach(day => {
      aggregated[day] = { totalTasks: 0, totalTime: 0, count: 0 };
    });
    
    // Sum up data for each day
    data.forEach(item => {
      aggregated[item.name].totalTasks += item.tasks;
      aggregated[item.name].totalTime += item.avgTime * item.tasks; // Total time
      aggregated[item.name].count += 1;
    });
    
    // Convert to array and calculate averages
    return daysOfWeek.map(day => {
      const dayData = aggregated[day];
      
      // If no data for this day in the selected range, return zeros
      if (dayData.count === 0) {
        return { name: day, tasks: 0, avgTime: 0, date: '' };
      }
      
      return {
        name: day,
        tasks: dayData.totalTasks,
        // Calculate weighted average of time per task
        avgTime: Math.round(dayData.totalTime / dayData.totalTasks),
        date: ''
      };
    });
  }
  
  // Helper method to simulate API delay
  private async simulateApiDelay() {
    return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  }
}

export const reportDataService = new ReportDataService();
