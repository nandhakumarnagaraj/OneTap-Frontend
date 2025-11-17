export interface AttendanceSummary {
    sid: number;
    sname: string;
    rollNumber: string;
    totalDaysPresent: number;
    totalDaysAbsent: number;
    averageHoursPerDay: number; 
    attendancePercentage: number;
}