import { Component, input, output } from "@angular/core";
import { Checklist, RemoveChecklist } from "../../shared/interfaces/checklist";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-checklist-header',
  template: `
    <header>
      <a routerLink="/home">Back</a>
      <h1>
        {{ checklist().title }}
      </h1>
      <div>
        <button (click)="resetChecklist.emit(checklist().id)">Reset</button>
        <button (click)="addItem.emit()">Add item</button>
      </div>
    </header>
  `,
  imports: [RouterLink],
  styles: [
    `
      button {
        margin-left: 1rem;
      }

    `
  ]
})
export class ChecklistHeaderComponent {
  checklist = input.required<Checklist>();
  addItem = output();
  resetChecklist = output<RemoveChecklist>();
}
