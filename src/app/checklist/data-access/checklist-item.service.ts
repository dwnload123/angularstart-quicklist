import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { AddChecklistItem, ChecklistItem, EditChecklistItem, RemoveChecklistItem } from "../../shared/interfaces/checklist-item";
import { Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RemoveChecklist } from "../../shared/interfaces/checklist";
import { StorageService } from "../../shared/data-access/storage.service";

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistItemService {
  storageService = inject(StorageService);
  //state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
  });

  //selector
  checklistItem = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);
  //sources
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  edit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklist>();
  checklistRemoved$ = new Subject<RemoveChecklist>();
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  constructor() {
    //effects
    effect(() => {
      if(this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItem());
      }
    })

    //reducers
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) => {
      this.state.update((state) => ({
        ...state,
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          }
        ],
      }))
    })

    this.toggle$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        )
      }))
    )

    this.reset$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistItemId ? { ...item, checked: false } : item
        )
      }))
    )

    this.checklistItemsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklistItems) =>
        this.state.update((state) => ({
          ...state,
          checklistItems,
          loaded: true,
        }))
    })

    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === update.id ? { ...item, title: update.data.title } : item
        ),
      }))
    )

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter((item) => item.id !== id)
      }))
    )

    this.checklistRemoved$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        )
      }))

    )

  }
}
