export interface BatchCreateRequest {
    batchName: string;
    batchCode: string;
    maxCount: number;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    trainingStartDate: string;
    trainingEndDate: string;
    batchCapacity: number;
}