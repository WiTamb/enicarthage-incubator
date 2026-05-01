import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="overlay" (click)="cancel.emit()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm animate-scale-in">
          <div class="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
               [class]="type === 'danger' ? 'bg-danger-50' : 'bg-primary-50'">
            @if (type === 'danger') {
              <svg class="w-6 h-6 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
            } @else {
              <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
          </div>
          <h3 class="text-lg font-semibold text-center text-text-primary mb-2">{{ title }}</h3>
          <p class="text-sm text-text-secondary text-center mb-6">{{ message }}</p>
          <div class="flex gap-3">
            <button (click)="cancel.emit()" class="btn-ghost btn-sm flex-1">Annuler</button>
            <button (click)="confirm.emit()" class="btn-sm flex-1"
                    [class]="type === 'danger' ? 'btn-danger' : 'btn-primary'">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmer';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() confirmText = 'Confirmer';
  @Input() type: 'danger' | 'primary' = 'primary';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
