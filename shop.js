/* NEON SHOP: SEARCH, FILTER, SORT & SALE BADGES */
(() => {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortPrice = document.getElementById("sortPrice");
    const productCount = document.getElementById("productCount");
    const container = document.querySelector(".con");

    if (!container) return;

    const cards = Array.from(container.querySelectorAll(".products"));

    // Read the product category from its image URL
    function getCategory(card) {
        const img = card.querySelector("img");
        const src = (img?.getAttribute("src") || "").toLowerCase();

        if (src.includes("lehenga-choli")) return "lehenga";
        if (src.includes("gown")) return "dress";

        if (
            src.includes("kids-apparel") ||
            src.includes("kids-ethnic") ||
            src.includes("kids-ethnic-set")
        ) return "kids";

        if (src.includes("ethnic-set") || src.includes("/kurta/")) {
            return "ethnic";
        }

        return "other";
    }

    // Read the current price from the existing product card
    function getPrice(card) {
        const priceText =
            card.querySelector(".text p")?.textContent || "";

        const price = Number(priceText.replace(/[^0-9.]/g, ""));
        return Number.isFinite(price) ? price : 0;
    }

    // Add a demo sale badge and price display only once
    cards.forEach(card => {
        const text = card.querySelector(".text");
        if (!text || text.querySelector(".price-box")) return;

        const priceElement = text.querySelector("p");
        if (!priceElement) return;

        const price = getPrice(card);
        if (price <= 0) return;

        // Demo discount: 20% off the calculated original price
        const originalPrice = price / 0.8;

        const badge = document.createElement("span");
        badge.className = "sale-badge";
        badge.textContent = "SALE";

        const imageBox = card.querySelector(".image");
        if (imageBox) imageBox.appendChild(badge);

        const priceBox = document.createElement("div");
        priceBox.className = "price-box";

        const newPrice = document.createElement("span");
        newPrice.className = "new-price";
        newPrice.textContent = "$" + price.toFixed(2);

        const oldPrice = document.createElement("span");
        oldPrice.className = "old-price";
        oldPrice.textContent = "$" + originalPrice.toFixed(2);

        const discount = document.createElement("span");
        discount.className = "discount";
        discount.textContent = "20% OFF";

        priceBox.append(newPrice, oldPrice, discount);

        // Keep the original price paragraph in the HTML,
        // but hide it to avoid showing the price twice.
        priceElement.hidden = true;
        priceElement.after(priceBox);
    });

    // Search, category filter and price sorting
    function updateProducts() {
        const query = (searchInput?.value || "")
            .trim()
            .toLowerCase();

        const category = categoryFilter?.value || "all";
        const sort = sortPrice?.value || "default";

        const filtered = cards.filter(card => {
            const name =
                card.querySelector("h5")?.textContent.toLowerCase() || "";

            const brand =
                card.querySelector(".text span")?.textContent.toLowerCase() || "";

            const matchesSearch =
                name.includes(query) || brand.includes(query);

            const matchesCategory =
                category === "all" || getCategory(card) === category;

            return matchesSearch && matchesCategory;
        });

        filtered.sort((a, b) => {
            if (sort === "low-high") return getPrice(a) - getPrice(b);
            if (sort === "high-low") return getPrice(b) - getPrice(a);
            return cards.indexOf(a) - cards.indexOf(b);
        });

        // Hide all cards, then show matching cards in sorted order
        cards.forEach(card => {
            card.style.display = "none";
        });

        filtered.forEach(card => {
            card.style.display = "";
            container.appendChild(card);
        });

        if (productCount) {
            productCount.textContent =
                `Showing ${filtered.length} of ${cards.length} products`;
        }

        let noResults = document.getElementById("noProductsMessage");

        if (filtered.length === 0) {
            if (!noResults) {
                noResults = document.createElement("p");
                noResults.id = "noProductsMessage";
                noResults.textContent = "No matching products found.";
                noResults.style.cssText =
                    "text-align:center;padding:25px;width:100%;";
                container.appendChild(noResults);
            }
            noResults.hidden = false;
        } else if (noResults) {
            noResults.hidden = true;
        }
    }

    searchInput?.addEventListener("input", updateProducts);
    categoryFilter?.addEventListener("change", updateProducts);
    sortPrice?.addEventListener("change", updateProducts);

    updateProducts();
})();