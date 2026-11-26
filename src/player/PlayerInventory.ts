export class PlayerInventory {
  public items: string[];

  constructor(initial: string[]) {
    this.items = [...initial];
  }

  public addItem(item: string): boolean {
    if (this.items.includes(item)) return false;
    this.items.push(item);
    return true;
  }

  public hasItem(item: string): boolean {
    return this.items.includes(item);
  }
}
