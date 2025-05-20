const items = [
    {
        name: "David Clark",
        ticker: "MSFT",
        storage: "P290.50",
        type: "Technology company, developer of Windows OS.",
        price: "P290.50",
        quantity: 20,
        dateAdded: "2023-05-22",
        description: "Microsoft Corp."
    },
    {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        storage: "P880.75",
        type: "Graphics card and AI hardware leader.",
        price: "P880.75",
        quantity: 15,
        dateAdded: "2022-12-10",
        description: "NVIDIA Corporation"
    },
    {
        name: "Alphabet Inc.",
        ticker: "GOOGL",
        storage: "P2,750.60",
        type: "Google parent company, focuses on AI, advertising.",
        price: "P2,750.60",
        quantity: 8,
        dateAdded: "2023-04-10",
        description: "Alphabet Inc."
    },
    {
        name: "Netflix Inc.",
        ticker: "NFLX",
        storage: "P500.35",
        type: "Streaming service for movies and TV shows.",
        price: "P500.35",
        quantity: 12,
        dateAdded: "2022-09-01",
        description: "Netflix Inc."
    }
];

function renderTable() {
    const tableBody = document.getElementById('itemsTable');
    tableBody.innerHTML = '';

    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b';

        row.innerHTML = `
            <td class="p-2"><input type="text" value="${item.name}" onchange="updateItem(${index}, 'name', this.value)" class="w-full"></td>
            <td class="p-2"><input type="text" value="${item.ticker}" onchange="updateItem(${index}, 'ticker', this.value)" class="w-full"></td>
            <td class="p-2"><input type="text" value="${item.storage}" onchange="updateItem(${index}, 'storage', this.value)" class="w-full"></td>
            <td class="p-2"><input type="text" value="${item.type}" onchange="updateItem(${index}, 'type', this.value)" class="w-full"></td>
            <td class="p-2"><input type="text" value="${item.price}" onchange="updateItem(${index}, 'price', this.value)" class="w-full"></td>
            <td class="p-2"><input type="number" value="${item.quantity}" onchange="updateItem(${index}, 'quantity', this.value)" class="w-full"></td>
            <td class="p-2"><input type="date" value="${item.dateAdded}" onchange="updateItem(${index}, 'dateAdded', this.value)" class="w-full"></td>
            <td class="p-2"><input type="text" value="${item.description}" onchange="updateItem(${index}, 'description', this.value)" class="w-full"></td>
            <td class="p-2"><button onclick="deleteItem(${index})" class="bg-red-500 text-white px-2 py-1 rounded-lg">Delete</button></td>
        `;

        tableBody.appendChild(row);
    });

    updateTotals();
}

function updateItem(index, field, value) {
    items[index][field] = value;
    updateTotals();
}

function deleteItem(index) {
    items.splice(index, 1);
    renderTable();
}

function addItem() {
    items.push({
        name: "New Item",
        ticker: "TICKER",
        storage: "P0.00",
        type: "Type",
        price: "P0.00",
        quantity: 0,
        dateAdded: new Date().toISOString().split('T')[0],
        description: "Description"
    });
    renderTable();
}

function updateTotals() {
    const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price.replace('P', '').replace(',', '')), 0);
    document.getElementById('totalPrice').textContent = `P${totalPrice.toLocaleString()}`;
    document.getElementById('totalItems').textContent = items.length;
}

document.addEventListener('DOMContentLoaded', renderTable);