
import { GuestyPaginatedResponse, GuestyProperty, GuestyReservation, GuestyTask } from "./types";

// Base URL for Guesty API
const GUESTY_API_BASE_URL = 'https://open-api.guesty.com/v1';

/**
 * Service for interacting with the Guesty API
 */
export class GuestyApiService {
  private static instance: GuestyApiService;
  
  // Private constructor to enforce singleton pattern
  private constructor() {}
  
  /**
   * Get singleton instance of the GuestyApiService
   */
  public static getInstance(): GuestyApiService {
    if (!GuestyApiService.instance) {
      GuestyApiService.instance = new GuestyApiService();
    }
    return GuestyApiService.instance;
  }
  
  /**
   * Makes an authenticated request to the Guesty API via our edge function
   */
  private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
    try {
      // Use our Netlify serverless function as a proxy to manage credentials securely
      const response = await fetch(`/.netlify/functions/guesty-api?endpoint=${encodeURIComponent(endpoint)}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Guesty API error: ${errorData.message || response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('Error calling Guesty API:', error);
      throw error;
    }
  }
  
  /**
   * Get all properties from Guesty
   */
  async getProperties(params: { limit?: number; skip?: number } = {}): Promise<GuestyPaginatedResponse<GuestyProperty>> {
    let endpoint = '/listings';
    
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    
    return this.makeRequest<GuestyPaginatedResponse<GuestyProperty>>(endpoint);
  }
  
  /**
   * Get a single property from Guesty by ID
   */
  async getProperty(propertyId: string): Promise<GuestyProperty> {
    return this.makeRequest<GuestyProperty>(`/listings/${propertyId}`);
  }
  
  /**
   * Get all reservations from Guesty
   */
  async getReservations(params: { 
    limit?: number; 
    skip?: number; 
    listingIds?: string[];
    statuses?: ('inquiry' | 'pendingOwnerConfirmation' | 'canceled' | 'confirmed' | 'declined')[];
    checkInDateGte?: string;
    checkOutDateLte?: string;
  } = {}): Promise<GuestyPaginatedResponse<GuestyReservation>> {
    let endpoint = '/reservations';
    
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.listingIds && params.listingIds.length) {
      queryParams.append('listingIds', params.listingIds.join(','));
    }
    if (params.statuses && params.statuses.length) {
      queryParams.append('statuses', params.statuses.join(','));
    }
    if (params.checkInDateGte) {
      queryParams.append('checkInDateLocalized[gte]', params.checkInDateGte);
    }
    if (params.checkOutDateLte) {
      queryParams.append('checkOutDateLocalized[lte]', params.checkOutDateLte);
    }
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    
    return this.makeRequest<GuestyPaginatedResponse<GuestyReservation>>(endpoint);
  }
  
  /**
   * Get a single reservation from Guesty by ID
   */
  async getReservation(reservationId: string): Promise<GuestyReservation> {
    return this.makeRequest<GuestyReservation>(`/reservations/${reservationId}`);
  }
  
  /**
   * Get all tasks from Guesty
   */
  async getTasks(params: {
    limit?: number;
    skip?: number;
    listingIds?: string[];
    statuses?: ('pending' | 'inProgress' | 'completed' | 'canceled')[];
    dueDateGte?: string;
    dueDateLte?: string;
  } = {}): Promise<GuestyPaginatedResponse<GuestyTask>> {
    let endpoint = '/tasks';
    
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.listingIds && params.listingIds.length) {
      queryParams.append('listingIds', params.listingIds.join(','));
    }
    if (params.statuses && params.statuses.length) {
      queryParams.append('statuses', params.statuses.join(','));
    }
    if (params.dueDateGte) {
      queryParams.append('dueDate[gte]', params.dueDateGte);
    }
    if (params.dueDateLte) {
      queryParams.append('dueDate[lte]', params.dueDateLte);
    }
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    
    return this.makeRequest<GuestyPaginatedResponse<GuestyTask>>(endpoint);
  }
  
  /**
   * Get a single task from Guesty by ID
   */
  async getTask(taskId: string): Promise<GuestyTask> {
    return this.makeRequest<GuestyTask>(`/tasks/${taskId}`);
  }
  
  /**
   * Create a new task in Guesty
   */
  async createTask(task: {
    title: string;
    description?: string;
    status: 'pending' | 'inProgress' | 'completed' | 'canceled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    taskType?: string;
    listingId?: string;
    assigneeId?: string;
    dueDate: string;
  }): Promise<GuestyTask> {
    const payload = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      taskType: task.taskType,
      listing: task.listingId ? { _id: task.listingId } : undefined,
      assignee: task.assigneeId ? { _id: task.assigneeId } : undefined,
      dueDate: task.dueDate,
    };
    
    return this.makeRequest<GuestyTask>('/tasks', 'POST', payload);
  }
  
  /**
   * Update an existing task in Guesty
   */
  async updateTask(taskId: string, updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'inProgress' | 'completed' | 'canceled';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    taskType?: string;
    listingId?: string;
    assigneeId?: string;
    dueDate?: string;
  }): Promise<GuestyTask> {
    const payload: Record<string, any> = {};
    
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.taskType !== undefined) payload.taskType = updates.taskType;
    if (updates.listingId !== undefined) payload.listing = { _id: updates.listingId };
    if (updates.assigneeId !== undefined) payload.assignee = { _id: updates.assigneeId };
    if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
    
    return this.makeRequest<GuestyTask>(`/tasks/${taskId}`, 'PUT', payload);
  }
}

// Export singleton instance
export const guestyApiService = GuestyApiService.getInstance();
