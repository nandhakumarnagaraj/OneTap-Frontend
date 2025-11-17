export interface StudentCreateRequest {
    sname: string;
    email: string | null; 
    phone: string | null; 
    rollNumber: string;
    batchId: number | null; 
}