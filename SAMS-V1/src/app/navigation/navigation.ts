import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

type View = 'dashboard' | 'attendance' | 'students' | 'batches' | 'create-student';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css']
})
export class NavigationComponent {
  @Input() currentView!: WritableSignal<View>;
  @Input() isLoading!: WritableSignal<boolean>;
  @Input() views: { view: View, label: string }[] = [];
  @Output() viewChange = new EventEmitter<View>();

  setView(view: View): void {
    this.viewChange.emit(view);
  }

  getTabClasses(view: View): string {
    const baseClasses = 'btn mx-2';
    return this.currentView() === view
      ? `${baseClasses} btn-primary`
      : `${baseClasses} btn-outline-primary`;
  }

  getIcon(view: View): string {
    // Icons will be handled in the main component for now
    return '';
  }
}
