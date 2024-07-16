import { Component, input, output } from "@angular/core";
import { Checklist, RemoveChecklist } from "../../shared/interfaces/checklist";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'checklist-list',
  template: `
    @for(checklist of checklists(); track checklist.id) {
      <li>
        <a routerLink="/checklist/{{ checklist.id }}">
          {{ checklist.title }}
        </a>
        <div>
          <button (click)="edit.emit(checklist)">Edit</button>
          <button (click)="delete.emit(checklist.id)">Delete</button>
        </div>
      </li>
    } @empty {
      <p>Nothing.</p>
    }
  `,
  imports: [
    RouterLink,
  ]
})
export class ChecklistListComponent {
  checklists = input.required<Checklist[]>();
  delete = output<RemoveChecklist>();
  edit = output<Checklist>();
}
