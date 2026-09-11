import {Item, Order} from './model.js';

const orderForm = document.querySelector<HTMLFormElement>('#order-form')!;
const ordersContainer = document.querySelector<HTMLElement>('#orders')!;

let orders: Order[] = loadOrders();

function loadOrders(): Order[] {
  const saved = localStorage.getItem('orders');
  if (!saved) {
    return [];
  }

  const parsed = JSON.parse(saved);
  return parsed.map(
    (order: Order) => new Order(order.orderId, order.items, order.status),
  );
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function createOrderCard(order: Order) {
  const card = document.createElement('article');
  card.setAttribute('data-testid', 'entity-card');
  card.classList.add('card');

  card.innerHTML = `
    <h2>Заказ #${order.orderId}</h2>
    <p>ID заказа: ${order.orderId}</p>
    <label>
      Статус
      <select class="status-select">
        <option value="new">new</option>
        <option value="processing">processing</option>
        <option value="completed">completed</option>
      </select>
    </label>
    <h3>Товары</h3>
    <ul class="items-list"></ul>
    <form class="item-form">
      <input type="text" name="name" placeholder="Название" required />
      <input type="number" name="price" placeholder="Цена" min="0" required />
      <button type="submit">Добавить товар</button>
    </form>
    <p>Общая сумма: <span class="total">${order.getTotal()}</span></p>
    <button type="button" class="delete-order" data-testid="delete-entity">
      Удалить заказ
    </button>
  `;

  const statusSelect = card.querySelector<HTMLSelectElement>('.status-select')!;
  const itemsList = card.querySelector<HTMLUListElement>('.items-list')!;
  const itemForm = card.querySelector<HTMLFormElement>('.item-form')!;
  const total = card.querySelector<HTMLSpanElement>('.total')!;
  const deleteButton = card.querySelector<HTMLButtonElement>('.delete-order')!;

  statusSelect.value = order.status;
  bindStatusChange(order, statusSelect);
  bindItemForm(order, itemForm, itemsList, total);
  bindDeleteOrder(order, card, deleteButton);

  for (const item of order.items) {
    itemsList.append(createItemElement(order, item, itemsList, total));
  }

  return card;
}

function bindStatusChange(order: Order, statusSelect: HTMLSelectElement) {
  statusSelect.addEventListener('change', () => {
    order.status = statusSelect.value;
    saveOrders();
  });
}

function bindItemForm(
  order: Order,
  itemForm: HTMLFormElement,
  itemsList: HTMLUListElement,
  total: HTMLSpanElement,
) {
  itemForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(itemForm);
    const item: Item = {
      name: String(formData.get('name')),
      price: Number(formData.get('price')),
    };
    await addItem(order, item);
    saveOrders();
    itemsList.append(createItemElement(order, item, itemsList, total));
    updateTotal(order, total);
    itemForm.reset();
  });
}

function bindDeleteOrder(
  order: Order,
  card: HTMLElement,
  deleteButton: HTMLButtonElement,
) {
  deleteButton.addEventListener('click', async () => {
    await removeOrder(order.orderId);
    saveOrders();
    card.remove();
  });
}

function createItemElement(
  order: Order,
  item: Item,
  itemsList: HTMLUListElement,
  total: HTMLSpanElement,
) {
  const li = document.createElement('li');
  li.dataset.itemName = item.name;
  li.innerHTML = `
    <span>${item.name} - ${item.price}</span>
    <button type="button">Удалить товар</button>
  `;

  const deleteButton = li.querySelector<HTMLButtonElement>('button')!;
  deleteButton.addEventListener('click', async () => {
    await removeItem(order, item.name);
    saveOrders();
    updateTotal(order, total);
    removeItemElements(itemsList, item.name);
  });

  return li;
}

function updateTotal(order: Order, total: HTMLSpanElement) {
  total.textContent = String(order.getTotal());
}

function removeItemElements(itemsList: HTMLUListElement, itemName: string) {
  const itemElements = itemsList.querySelectorAll<HTMLLIElement>('li');
  for (const itemElement of itemElements) {
    if (itemElement.dataset.itemName === itemName) {
      itemElement.remove();
    }
  }
}

function addOrder(order: Order): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      orders.push(order);
      resolve();
    }, 300);
  });
}

function removeOrder(orderId: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      orders = orders.filter((order) => order.orderId !== orderId);
      resolve();
    }, 300);
  });
}

function addItem(order: Order, item: Item): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      order.addItem(item);
      resolve();
    }, 300);
  });
}

function removeItem(order: Order, itemName: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      order.removeItem(itemName);
      resolve();
    }, 300);
  });
}

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(orderForm);
  const orderId = Number(formData.get('orderId'));
  const status = String(formData.get('status'));

  const exists = orders.some((order) => order.orderId === orderId);

  if (exists) {
    alert(`Заказ #${orderId} уже существует`);
    return;
  }

  const order = new Order(orderId, [], status);
  await addOrder(order);
  saveOrders();
  ordersContainer.append(createOrderCard(order));
  orderForm.reset();
});

for (const order of orders) {
  ordersContainer.append(createOrderCard(order));
}
