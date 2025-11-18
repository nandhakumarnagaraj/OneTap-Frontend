import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BatchResponse } from '../Model/batch-response';
import { BatchCreateRequest } from '../Model/batch-create-request';

@Injectable({
  providedIn: 'root'
})
export class SamsDataService {
  private apiUrl = 'http://localhost:8080/api/batches'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getBatch(id: number): Observable<BatchResponse> {
    return this.http.get<BatchResponse>(`${this.apiUrl}/${id}`);
  }

  updateBatch(id: number, batch: BatchCreateRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, batch);
  }
}
