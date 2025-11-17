import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiResponse } from '../Model/api-response'; // Assuming models.ts is in the same directory
import { StudentResponse } from '../Model/studtent-response';
import { BatchResponse } from '../Model/batch-response';

// --- Type Definition for Service Output ---
interface DataResult<T> {
  data: T;
  errorMessage: string | null;
}

// --- Service Definition ---

@Injectable({
  providedIn: 'root',
})
export class SamsDataService {
  private API_BASE_URL = 'http://localhost:8080/sams/api/v1';
  private http: HttpClient = inject(HttpClient);

  /**
   * Handles network/CORS errors (Status 0) and API response failures (4xx/5xx).
   * Throws an Error object for the component to catch.
   */
  private handleObservableError<T>(dataType: 'batch' | 'student') {
    return (error: HttpErrorResponse | any): Observable<ApiResponse<T>> => {
      let errorMessage: string;

      if (error.status === 0) {
        // Critical network/CORS error (server down, wrong URL, or firewall/proxy blocking)
        errorMessage = `Connection failed (Status 0). Cannot connect to the Spring Boot backend at ${this.API_BASE_URL}. Please ensure your server is running and CORS is configured.`;
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      }

      // Standard API errors (4xx, 5xx), retrieving message from the backend's ApiResponse structure
      errorMessage =
        error.error?.message || error.message || `API call failed for ${dataType} data.`;
      console.error(`API Error on ${dataType} request:`, error);

      return throwError(() => new Error(errorMessage));
    };
  }

  // --- Fetching Methods ---

  /**
   * Fetches all batches. Returns an Observable that emits { data: BatchResponse[], errorMessage: null }.
   */
  getAllBatches(): Observable<DataResult<BatchResponse[]>> {
    const url = `${this.API_BASE_URL}/batches`;
    return this.http.get<ApiResponse<BatchResponse[]>>(url).pipe(
      catchError(this.handleObservableError<BatchResponse[]>('batch')),
      map((response) => {
        if (!response.success) {
          // This handles cases where the API returns a non-error status (e.g., 200 OK) but reports failure
          throw new Error(response.message);
        }
        return {
          data: response.data || [],
          errorMessage: null,
        };
      })
    );
  }

  /**
   * Fetches all students. Returns an Observable that emits { data: StudentResponse[], errorMessage: null }.
   */
  getAllStudents(): Observable<DataResult<StudentResponse[]>> {
    const url = `${this.API_BASE_URL}/students`;
    return this.http.get<ApiResponse<StudentResponse[]>>(url).pipe(
      catchError(this.handleObservableError<StudentResponse[]>('student')),
      map((response) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return {
          data: response.data || [],
          errorMessage: null,
        };
      })
    );
  }

  // --- Attendance Methods ---

  /**
   * Checks in a student by ID. Returns an Observable of the updated StudentResponse.
   */
  checkIn(studentId: number): Observable<StudentResponse> {
    const url = `${this.API_BASE_URL}/students/${studentId}/checkin`;
    return this.http.patch<ApiResponse<StudentResponse>>(url, {}).pipe(
      catchError(this.handleObservableError<StudentResponse>('student')),
      map((response) => {
        if (response.success) {
          return response.data;
        }
        // Handles logical failures returned by the API (e.g., "Student is already checked in")
        throw new Error(response.message);
      })
    );
  }

  /**
   * Checks out a student by ID. Returns an Observable of the updated StudentResponse.
   */
  checkOut(studentId: number): Observable<StudentResponse> {
    const url = `${this.API_BASE_URL}/students/${studentId}/checkout`;
    return this.http.patch<ApiResponse<StudentResponse>>(url, {}).pipe(
      catchError(this.handleObservableError<StudentResponse>('student')),
      map((response) => {
        if (response.success) {
          return response.data;
        }
        // Handles logical failures returned by the API (e.g., "Student must check in before checking out")
        throw new Error(response.message);
      })
    );
  }
}
