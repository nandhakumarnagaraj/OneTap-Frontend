import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-metrics.html',
  styleUrls: ['./dashboard-metrics.css']
})
export class DashboardMetricsComponent {
  @Input() totalStudents = 0;
  @Input() activeBatchesCount = 0;
  @Input() checkedInCount = 0;
  @Input() attendanceRatio = 0;
}
