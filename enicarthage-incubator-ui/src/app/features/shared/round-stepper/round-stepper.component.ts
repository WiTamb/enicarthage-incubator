import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Round, ApplicationStatus } from '../../../core/models/session.model';

@Component({
  selector: 'app-round-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1 w-full">
      @for (r of rounds; track r.id; let i = $index; let last = $last) {
        <div class="flex items-center gap-1" [class.flex-1]="true">
          <!-- Step circle -->
          <div class="flex flex-col items-center gap-1 min-w-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                 [class]="stepClass(r, i)">
              @if (isCompleted(r, i)) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              } @else if (isEliminated(r, i)) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              } @else {
                {{ i + 1 }}
              }
            </div>
            <span class="text-[10px] font-medium text-center leading-tight max-w-[80px] truncate" [class]="labelClass(r, i)">{{ r.name }}</span>
          </div>
          <!-- Connector -->
          @if (!last) {
            <div class="flex-1 h-0.5 rounded-full mx-1 mt-[-16px] transition-all duration-500"
                 [class]="connectorClass(r, i)"></div>
          }
        </div>
      }
    </div>
  `
})
export class RoundStepperComponent {
  @Input() rounds: Round[] = [];
  @Input() currentRoundIndex?: number;
  @Input() status?: ApplicationStatus;

  private get activeIdx(): number { return (this.currentRoundIndex ?? 0) - 1; }
  private get isRejected(): boolean { return !!this.status && (this.status === 'REJECTED' || this.status.startsWith('ELIMINATED')); }
  private get eliminatedAtIdx(): number {
    if (!this.status) return -1;
    const m = this.status.match(/ELIMINATED_ROUND_(\d+)/);
    return m ? parseInt(m[1], 10) - 1 : -1;
  }

  isCompleted(r: Round, i: number): boolean {
    if (this.status === 'COMPLETED') return true;
    return i < this.activeIdx;
  }
  isEliminated(r: Round, i: number): boolean { return i === this.eliminatedAtIdx; }

  stepClass(r: Round, i: number): string {
    if (this.isEliminated(r, i)) return 'bg-danger-500 text-white';
    if (this.status === 'COMPLETED') return 'bg-success-500 text-white';
    if (this.isCompleted(r, i)) return 'bg-success-500 text-white';
    if (i === this.activeIdx) return 'bg-primary-600 text-white ring-4 ring-primary-100';
    return 'bg-slate-100 text-text-muted';
  }
  labelClass(r: Round, i: number): string {
    if (this.isEliminated(r, i)) return 'text-danger-600';
    if (this.isCompleted(r, i)) return 'text-success-600';
    if (i === this.activeIdx) return 'text-primary-600';
    return 'text-text-muted';
  }
  connectorClass(r: Round, i: number): string {
    if (this.isCompleted(r, i) || this.status === 'COMPLETED') return 'bg-success-400';
    if (i === this.eliminatedAtIdx) return 'bg-danger-300';
    if (i < this.activeIdx) return 'bg-success-400';
    return 'bg-slate-200';
  }
}
