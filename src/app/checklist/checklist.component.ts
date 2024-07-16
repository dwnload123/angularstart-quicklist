import { Component, computed, effect, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChecklistService } from "../shared/data-access/checklist.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { ChecklistHeaderComponent } from "./ui/checklist-header.component";
import { FormBuilder } from "@angular/forms";
import { ChecklistItemService } from "./data-access/checklist-item.service";
import { ChecklistItem } from "../shared/interfaces/checklist-item";
import { ModalComponent } from "../shared/ui/modal.component";
import { FormModalComponent } from "../shared/ui/form-modal.component";
import { ChecklistItemListComponent } from "./ui/cheklist-item-list-component";

@Component({
  standalone: true,
  selector: 'app-checklist',
  template: `
    @if (checklist(); as checklist) {
      <app-checklist-header
        [checklist]="checklist"
        (addItem)="checklistItemBeingEdited.set({})"
        (resetChecklist)="checklistItemService.reset$.next($event)"
      />
    }

    <app-checklist-item-list
      [checklistItems]="items()"
      (toggle)="checklistItemService.toggle$.next($event)"
      (edit)="checklistItemBeingEdited.set($event)"
      (delete)="checklistItemService.remove$.next($event)"
    />

    <app-modal
      [isOpen]="!!checklistItemBeingEdited()"
    >
      <ng-template>
        <app-form-modal
          title="Create item"
          [formGroup]="checklistItemForm"
          (save)="
            checklistItemBeingEdited()?.id
              ? checklistItemService.edit$.next({
                id: checklistItemBeingEdited()!.id!,
                data: checklistItemForm.getRawValue(),
              })
              : checklistItemService.add$.next({
                  item: checklistItemForm.getRawValue(),
                  checklistId: checklist()?.id!,
                })
          "
          (close)="checklistItemBeingEdited.set(null)"
        >
        </app-form-modal>
      </ng-template>
    </app-modal>
  `,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent,
    ChecklistItemListComponent,
  ]
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  checklistItemService = inject(ChecklistItemService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get('id'))
  );
  items = computed(() =>
    this.checklistItemService
      .checklistItem()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  checklistItemForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if(!checklistItem) {
        this.checklistItemForm.reset();
      } else {
        this.checklistItemForm.patchValue({
          title: checklistItem.title,
        })
      }
    })
  }

}
