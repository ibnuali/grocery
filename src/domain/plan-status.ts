export interface ChecklistItemStatus {
  is_checked: boolean
}

export const isShoppingComplete = (
  status: string,
  items: readonly ChecklistItemStatus[] | undefined
): boolean => status === 'COMPLETED' || (items !== undefined && items.length > 0 && items.every((item) => item.is_checked))
