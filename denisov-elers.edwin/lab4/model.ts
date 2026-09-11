export interface Item {
  name: string;
  price: number;
}

export class Order {
  readonly orderId: number;
  readonly items: Item[];
  status: string;

  constructor(orderId: number, items: Item[], status: string) {
    this.orderId = orderId;
    this.items = items;
    this.status = status;
  }

  addItem(item: Item) {
    this.items.push(item);
  }

  removeItem(name: string) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].name === name) {
        this.items.splice(i, 1);
      }
    }
  }

  getTotal() {
    return this.items.reduce((acc, curr) => acc + curr.price, 0);
  }
}

export function groupOrdersByStatus(orders: Order[]) {
  const result: Record<string, Order[]> = {};
  for (const order of orders) {
    if (!result[order.status]) {
      result[order.status] = [];
    }
    result[order.status].push(order);
  }
  return result;
}

export function getUniqueItems(orders: Order[]) {
  const result: Item[] = [];
  for (const order of orders) {
    for (const item of order.items) {
      const exists = result.some(
        (el) => el.name === item.name && el.price === item.price,
      );
      if (!exists) {
        result.push(item);
      }
    }
  }
  return result;
}

export function groupOrdersByTotal(orders: Order[]) {
  const result: Record<string, Order[]> = {
    upTo1000: [],
    from1001to5000: [],
    over5000: [],
  };
  for (const order of orders) {
    const total = order.getTotal();
    if (total <= 1000) {
      result.upTo1000.push(order);
    } else if (total <= 5000) {
      result.from1001to5000.push(order);
    } else {
      result.over5000.push(order);
    }
  }
  return result;
}

export function findOrdersByItem(orders: Order[], itemName: string) {
  return orders.filter((order) =>
    order.items.some((item) => item.name === itemName),
  );
}

export function findOrdersByStatus(orders: Order[], status: string) {
  return orders.filter((order) => order.status === status);
}
