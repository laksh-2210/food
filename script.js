```javascript
const foods = [
    {
        id: 1,
        name: "Kerala Parotta",
        category: "South Indian",
        price: 40,
        description: "Soft, flaky and delicious parotta",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Plain Dosa",
        category: "South Indian",
        price: 50,
        description: "Crispy golden dosa with chutney",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Chicken Rice",
        category: "Rice",
        price: 140,
        description: "Hot and tasty chicken fried rice",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Mutton Biryani",
        category: "Rice",
        price: 280,
        description: "Aromatic biryani with tender mutton",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&auto=format&fit=crop"
    },
    {
        id: 5,
        name: "Chicken Biryani",
        category: "Rice",
        price: 200,
        description: "Flavourful chicken dum biryani",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop"
    },
    {
        id: 6,
        name: "Cool Drinks",
        category: "Drinks",
        price: 50,
        description: "Refreshing chilled drinks",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?w=600&auto=format&fit=crop"
    }
];

let cart = {};
let activeCategory = "All";

try {
    cart = JSON.parse(
        localStorage.getItem("foodieExpressCart")
    ) || {};
} catch (error) {
    cart = {};
}

function money(amount) {
    return "₹" + amount;
}

function saveCart() {
    localStorage.setItem(
        "foodieExpressCart",
        JSON.stringify(cart)
    );
}

function renderFoods() {
    const grid = document.getElementById("foodGrid");
    const search = document.getElementById("search")
        .value.toLowerCase();

    const filtered = foods.filter(function(food) {
        const matchesCategory =
            activeCategory === "All" ||
            food.category === activeCategory;

        const matchesSearch =
            (food.name + " " + food.description)
                .toLowerCase()
                .includes(search);

        return matchesCategory && matchesSearch;
    });

    grid.innerHTML = "";

    filtered.forEach(function(food) {
        const card = document.createElement("article");
        card.className = "food-card";

        card.innerHTML = `
            <img src="${food.image}"
                alt="${food.name}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://placehold.co/600x400/fff0e5/7b3522?text=${encodeURIComponent(food.name)}'">

            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>

                <div class="price-row">
                    <span class="price">${money(food.price)}</span>
                    <button class="add-btn" type="button">
                        + Add
                    </button>
                </div>
            </div>
        `;

        card.querySelector(".add-btn")
            .addEventListener("click", function() {
                addToCart(food);
            });

        grid.appendChild(card);
    });

    document.getElementById("noResults")
        .classList.toggle("hidden", filtered.length > 0);
}

function addToCart(food) {
    if (cart[food.id]) {
        cart[food.id].quantity++;
    } else {
        cart[food.id] = {
            ...food,
            quantity: 1
        };
    }

    saveCart();
    renderCart();
}

function changeQuantity(id, amount) {
    if (!cart[id]) return;

    cart[id].quantity += amount;

    if (cart[id].quantity <= 0) {
        delete cart[id];
    }

    saveCart();
    renderCart();
}

function removeFromCart(id) {
    delete cart[id];
    saveCart();
    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItems");
    const items = Object.values(cart);

    const count = items.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);

    const subtotal = items.reduce(function(sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    const delivery = subtotal > 0 ? 30 : 0;

    document.getElementById("cartCount").textContent = count;
    document.getElementById("subtotal").textContent =
        money(subtotal);
    document.getElementById("delivery").textContent =
        money(delivery);
    document.getElementById("total").textContent =
        money(subtotal + delivery);

    if (items.length === 0) {
        container.innerHTML =
            '<p class="empty">Your cart is empty. Add your favourite food!</p>';
        return;
    }

    container.innerHTML = "";

    items.forEach(function(item) {
        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <h4>${item.name}</h4>
            <p>${money(item.price)} each</p>

            <div class="quantity">
                <button type="button"
                    data-action="minus"
                    aria-label="Decrease ${item.name}">−</button>

                <span>${item.quantity}</span>

                <button type="button"
                    data-action="plus"
                    aria-label="Increase ${item.name}">+</button>

                <button type="button"
                    class="remove"
                    data-action="remove">Remove</button>
            </div>

            <p><strong>
                ${money(item.price * item.quantity)}
            </strong></p>
        `;

        div.querySelector('[data-action="minus"]')
            .addEventListener("click", function() {
                changeQuantity(item.id, -1);
            });

        div.querySelector('[data-action="plus"]')
            .addEventListener("click", function() {
                changeQuantity(item.id, 1);
            });

        div.querySelector('[data-action="remove"]')
            .addEventListener("click", function() {
                removeFromCart(item.id);
            });

        container.appendChild(div);
    });
}

// FOOD CATEGORY FILTER
document.getElementById("categories")
    .addEventListener("click", function(event) {
        const button = event.target.closest(
            "button[data-category]"
        );

        if (!button) return;

        activeCategory = button.dataset.category;

        document.querySelectorAll("#categories button")
            .forEach(function(btn) {
                btn.classList.toggle("active", btn === button);
            });

        renderFoods();
    });

// FOOD SEARCH
document.getElementById("search")
    .addEventListener("input", renderFoods);

// SHOW CART
function showCart() {
    document.getElementById("cart").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// GO TO MENU
function goMenu() {
    document.getElementById("menuSection").scrollIntoView({
        behavior: "smooth"
    });
}

// GO TO CHECKOUT
function goCheckout() {
    if (Object.keys(cart).length === 0) {
        alert("Please add food to your cart first!");
        goMenu();
        return;
    }

    document.getElementById("checkout").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("customerName").focus();
}

// ESCAPE HTML SPECIAL CHARACTERS
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// PLACE ORDER
document.getElementById("orderForm")
    .addEventListener("submit", function(event) {
        event.preventDefault();

        const items = Object.values(cart);

        if (items.length === 0) {
            alert("Your cart is empty. Please add food first.");
            return;
        }

        const name = document.getElementById("customerName")
            .value.trim();

        const phone = document.getElementById("phone")
            .value.trim();

        const address = document.getElementById("address")
            .value.trim();

        const payment = document.getElementById("payment").value;

        if (!name || !address || !/^[0-9]{10}$/.test(phone)) {
            alert("Please enter valid delivery details.");
            return;
        }

        const subtotal = items.reduce(function(sum, item) {
            return sum + item.price * item.quantity;
        }, 0);

        const orderId = "FD" + Date.now().toString().slice(-8);

        const order = {
            orderId: orderId,
            customer: name,
            phone: phone,
            address: address,
            payment: payment,
            items: items,
            total: subtotal + 30,
            status: "Order placed",
            date: new Date().toLocaleString()
        };

        let orders = [];

        try {
            orders = JSON.parse(
                localStorage.getItem("foodieExpressOrders")
            ) || [];
        } catch (error) {
            orders = [];
        }

        orders.unshift(order);

        localStorage.setItem(
            "foodieExpressOrders",
            JSON.stringify(orders)
        );

        document.getElementById("orderResult").innerHTML = `
            <div class="success" role="status">
                <h3>✅ Order Placed Successfully!</h3>
                <p>Thank you, ${escapeHTML(name)}!</p>
                <p>Order ID: <strong>${orderId}</strong></p>
                <p>Total Amount:
                    <strong>${money(order.total)}</strong>
                </p>
                <p>Payment: ${escapeHTML(payment)}</p>
                <p>Status: Order placed</p>
                <p>Your demo order is saved in this browser.</p>
            </div>
        `;

        cart = {};
        saveCart();
        renderCart();

        document.getElementById("orderForm").reset();

        document.getElementById("orderResult").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

// INITIALIZE WEBSITE
renderFoods();
renderCart();
```