/* NEON E-COMMERCE WEBSITE */

// Save and load data
const loadData = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
};

let cart = loadData("neonCart");
let wishlist = loadData("neonWishlist");

// Select website elements
const products = [...document.querySelectorAll(".products")];
const searchInput = document.querySelector(".search-box input");
const navIcons = document.querySelectorAll(".nav-icon");

const heartCount = navIcons[0]?.querySelector("span");
const cartCount = navIcons[1]?.querySelector("span");

// Read product information from your existing HTML
products.forEach((card, index) => {
    const name = card.querySelector(".text h5")?.textContent.trim()
        || `Product ${index + 1}`;

    const brand = card.querySelector(".text span")?.textContent.trim()
        || "NEON";

    const priceText = card.querySelector(".text p")?.textContent || "$0";
    const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;

    const image = card.querySelector("img")?.src || "";

    card.dataset.id = `neon-product-${index}`;
    card.dataset.name = name;
    card.dataset.brand = brand;
    card.dataset.price = price;
    card.dataset.image = image;

    // Add buttons without changing your existing HTML
    if (!card.querySelector(".neon-actions")) {
        const actions = document.createElement("div");
        actions.className = "neon-actions";

        actions.innerHTML = `
            <button type="button" class="add-cart">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
            <button type="button" class="add-wishlist"
                aria-label="Add to wishlist">
                <i class="fa-regular fa-heart"></i>
            </button>
        `;

        card.querySelector(".text").appendChild(actions);
    }
});

// Save data
function saveData() {
    localStorage.setItem("neonCart", JSON.stringify(cart));
    localStorage.setItem("neonWishlist", JSON.stringify(wishlist));
}

// Notification message
function notify(message) {
    let toast = document.querySelector(".neon-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "neon-toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.neonToastTimer);
    window.neonToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// Update navbar counters
function updateCounters() {
    if (cartCount) {
        cartCount.textContent = cart.reduce(
            (total, item) => total + item.qty, 0
        );
    }

    if (heartCount) {
        heartCount.textContent = wishlist.length;
    }

    products.forEach(card => {
        const button = card.querySelector(".add-wishlist");
        if (!button) return;

        const saved = wishlist.some(item => item.id === card.dataset.id);
        button.classList.toggle("selected", saved);
        button.innerHTML = saved
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';

        button.setAttribute("aria-pressed", String(saved));
    });
}

// Add product to cart
function addToCart(card) {
    const id = card.dataset.id;
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id,
            name: card.dataset.name,
            price: Number(card.dataset.price),
            image: card.dataset.image,
            qty: 1
        });
    }

    saveData();
    updateCounters();
    notify(`${card.dataset.name} added to cart!`);
}

// Wishlist toggle
function toggleWishlist(card) {
    const id = card.dataset.id;
    const existing = wishlist.some(item => item.id === id);

    if (existing) {
        wishlist = wishlist.filter(item => item.id !== id);
        notify("Removed from wishlist");
    } else {
        wishlist.push({
            id,
            name: card.dataset.name,
            price: Number(card.dataset.price),
            image: card.dataset.image
        });
        notify("Added to wishlist!");
    }

    saveData();
    updateCounters();
}

// One popup for cart and wishlist
function openPanel(type) {
    document.querySelector(".neon-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "neon-overlay";

    const isCart = type === "cart";
    const items = isCart ? cart : wishlist;

    overlay.innerHTML = `
        <section class="neon-panel" role="dialog"
            aria-modal="true" aria-label="${isCart ? "Shopping Cart" : "Wishlist"}">
            <div class="panel-heading">
                <h2>${isCart ? "Your Shopping Cart" : "Your Wishlist"}</h2>
                <button type="button" class="panel-close" aria-label="Close">×</button>
            </div>
            <div class="panel-items"></div>
            <div class="panel-footer"></div>
        </section>
    `;

    document.body.appendChild(overlay);

    const list = overlay.querySelector(".panel-items");
    const footer = overlay.querySelector(".panel-footer");

    function renderItems() {
        const currentItems = isCart ? cart : wishlist;

        if (!currentItems.length) {
            list.innerHTML = "<p class='empty-cart'>Nothing here yet. Explore our products!</p>";
            footer.innerHTML = "";
            return;
        }

        list.innerHTML = currentItems.map(item => `
            <div class="cart-row" data-item-id="${item.id}">
                <img src="${item.image}" alt="">
                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <p>$${item.price.toFixed(2)}</p>
                    ${isCart ? `
                        <div class="quantity-controls">
                            <button type="button" data-action="minus" aria-label="Decrease quantity">−</button>
                            <span>${item.qty}</span>
                            <button type="button" data-action="plus" aria-label="Increase quantity">+</button>
                        </div>` : ""}
                </div>
                <button type="button" class="remove-item" data-action="remove">
                    Remove
                </button>
            </div>
        `).join("");

        if (isCart) {
            const total = cart.reduce(
                (sum, item) => sum + item.price * item.qty, 0
            );

            footer.innerHTML = `
                <h3>Total: $${total.toFixed(2)}</h3>
                <button type="button" class="checkout-button">Continue to Checkout</button>
                <p class="demo-note">Shopping demo only — no payment is taken.</p>
            `;
        } else {
            footer.innerHTML = `
                <button type="button" class="continue-shopping">Continue Shopping</button>
            `;
        }
    }

    renderItems();

    overlay.addEventListener("click", event => {
        if (event.target === overlay ||
            event.target.closest(".panel-close") ||
            event.target.closest(".continue-shopping")) {
            overlay.remove();
            return;
        }

        const actionButton = event.target.closest("[data-action]");
        if (actionButton) {
            const row = actionButton.closest("[data-item-id]");
            const item = cart.find(product => product.id === row.dataset.itemId);
            const action = actionButton.dataset.action;

            if (action === "remove") {
                if (isCart) {
                    cart = cart.filter(product => product.id !== row.dataset.itemId);
                } else {
                    wishlist = wishlist.filter(product => product.id !== row.dataset.itemId);
                }
            } else if (item && action === "plus") {
                item.qty++;
            } else if (item && action === "minus") {
                item.qty--;
                if (item.qty <= 0) {
                    cart = cart.filter(product => product.id !== item.id);
                }
            }

            saveData();
            updateCounters();
            renderItems();
            return;
        }

        if (event.target.closest(".checkout-button")) {
            overlay.remove();
            showCheckout();
        }
    });
}

// Demo checkout form
function showCheckout() {
    if (!cart.length) {
        notify("Your cart is empty!");
        return;
    }

    document.querySelector(".neon-overlay")?.remove();

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const overlay = document.createElement("div");
    overlay.className = "neon-overlay";

    overlay.innerHTML = `
        <section class="neon-panel" role="dialog" aria-modal="true">
            <div class="panel-heading">
                <h2>Checkout Demo</h2>
                <button type="button" class="panel-close" aria-label="Close">×</button>
            </div>
            <p class="checkout-total">Order total: $${total.toFixed(2)}</p>
            <form class="checkout-form">
                <label>Full name
                    <input name="name" required maxlength="80">
                </label>
                <label>Email
                    <input name="email" type="email" required>
                </label>
                <label>Delivery address
                    <textarea name="address" required maxlength="300"></textarea>
                </label>
                <button class="checkout-button" type="submit">Place Demo Order</button>
            </form>
            <p class="demo-note">Demo only. No payment or real order processing.</p>
        </section>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest(".panel-close")) {
            overlay.remove();
        }
    });

    overlay.querySelector(".checkout-form").addEventListener("submit", event => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;

        const orderNumber = "NEON-" + Date.now().toString().slice(-8);
        cart = [];
        saveData();
        updateCounters();
        overlay.remove();
        notify(`Demo order ${orderNumber} created!`);
    });
}

// Product card buttons
document.addEventListener("click", event => {
    const cartButton = event.target.closest(".add-cart");
    const wishButton = event.target.closest(".add-wishlist");

    if (cartButton) {
        addToCart(cartButton.closest(".products"));
    }

    if (wishButton) {
        toggleWishlist(wishButton.closest(".products"));
    }
});

// Open cart and wishlist from navbar
navIcons[0]?.addEventListener("click", () => openPanel("wishlist"));
navIcons[1]?.addEventListener("click", () => openPanel("cart"));

// Live product search
searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    products.forEach(card => {
        const matches = card.textContent.toLowerCase().includes(query);
        card.hidden = !matches;
    });
});

// Hero Explore button scrolls to products
document.querySelector("#hero button")?.addEventListener("click", () => {
    document.querySelector("#product1")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Newsletter validation
const newsletterForm = document.querySelector(".email-button");
const newsletterEmail = newsletterForm?.querySelector('input[type="email"]');

newsletterEmail?.setAttribute("required", "");
newsletterEmail?.setAttribute("aria-label", "Your email address");

newsletterForm?.querySelector("button")?.addEventListener("click", () => {
    if (!newsletterEmail.checkValidity()) {
        newsletterEmail.reportValidity();
        return;
    }

    notify("Thanks for subscribing! (Demo)");
    newsletterEmail.value = "";
});

// Initial page setup
updateCounters();



/* NEON Product Search */

const neonSearchInput = document.querySelector(".search-box input");
const neonSearchIcon = document.querySelector(
    ".search-box .fa-magnifying-glass"
);

const neonProducts = document.querySelectorAll(".con .products");

function searchNeonProducts() {
    const searchText = neonSearchInput.value
        .trim()
        .toLowerCase();

    neonProducts.forEach(function(product) {
        const productText = product.textContent.toLowerCase();

        if (productText.includes(searchText)) {
            product.style.display = "";
        } else {
            product.style.display = "none";
        }
    });
}

// Search while typing
if (neonSearchInput) {
    neonSearchInput.addEventListener("input", searchNeonProducts);

    // Search when Enter is pressed
    neonSearchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            searchNeonProducts();
        }
    });
}

// Search icon click
if (neonSearchIcon) {
    neonSearchIcon.style.cursor = "pointer";
    neonSearchIcon.addEventListener("click", searchNeonProducts);
}