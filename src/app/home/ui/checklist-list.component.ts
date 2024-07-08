import { Component, input } from "@angular/core";
import { Checklist } from "../../shared/interfaces/checklist";
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
}
