export interface BatchResponse {
  batchId: number;
  batchName: string;
  batchCode: string;
  maxCount: number;
  currentCount: number;
  availableSlots: number;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'UPCOMING';
  isFull: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}
