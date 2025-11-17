export interface StudentResponse {
  sid: number;
  sname: string;
  email: string | null; 
  phone: string | null; 
  rollNumber: string;

  intime: string | null;
  outtime: string | null;

  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  hoursPresent: number;
  checkedIn: boolean; 
  
  createdAt: string;

  batchId: number | null;
  batchName: string | null;
  batchCode: string | null;
}