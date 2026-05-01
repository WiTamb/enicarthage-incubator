import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationStatus } from '../../../core/models/session.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="cls">{{ label }}</span>`
})
export class StatusBadgeComponent {
  @Input() status!: ApplicationStatus;

  get cls(): string {
    if (!this.status) return 'badge-slate';
    if (this.status === 'PENDING') return 'badge-warning';
    if (this.status === 'REJECTED' || this.status.startsWith('ELIMINATED')) return 'badge-danger';
    if (this.status === 'COMPLETED') return 'badge-success';
    if (this.status.startsWith('ACCEPTED')) return 'badge-primary';
    return 'badge-slate';
  }

  get label(): string {
    if (!this.status) return '';
    const map: Record<string, string> = {
      PENDING: 'En attente', REJECTED: 'Rejeté', COMPLETED: 'Terminé',
    };
    if (map[this.status]) return map[this.status];
    const accMatch = this.status.match(/ACCEPTED_ROUND_(\d+)/);
    if (accMatch) return `Round ${accMatch[1]}`;
    const elimMatch = this.status.match(/ELIMINATED_ROUND_(\d+)/);
    if (elimMatch) return `Éliminé R${elimMatch[1]}`;
    return this.status;
  }
}
