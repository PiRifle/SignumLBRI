export interface WeightedItem<T> {
    item: T;
    weight: number;
  }

export function distributedRandomPick<T>(weightedItems: WeightedItem<T>[]): T | null {
    const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
    let randomValue = Math.random() * totalWeight;
  
    for (const weightedItem of weightedItems) {
      randomValue -= weightedItem.weight;
      if (randomValue <= 0) {
        return weightedItem.item;
      }
    }
  
    return null; // In case the weightedItems array is empty or has invalid weights
}

export function randomPick<T>(list: T[]): T | null {
    if (list.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}