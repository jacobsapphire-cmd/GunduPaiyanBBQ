// --- Cart State ---
let cart = [];

// --- Global Functions for HTML onClick ---
function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.toggle('open');
    }
}

function addToCart(itemName, itemPrice) {
    // Check if item already exists in cart
    const existingItem = cart.find(i => i.name === itemName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }
    
    // Add a small animation to the cart button
    const cartBtn = document.querySelector('.cart-float');
    cartBtn.style.transform = 'scale(1.3)';
    setTimeout(() => { cartBtn.style.transform = ''; }, 200);

    updateCartUI();
    showToast(`Added ${itemName} to cart!`);
}

function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (toast) {
        toast.innerText = message;
        toast.classList.add('show');
        
        // Clear previous timeout if multiple clicks happen quickly
        if (window.toastTimeout) {
            clearTimeout(window.toastTimeout);
        }
        
        window.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500); // 2.5 seconds
    }
}

function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotalPrice = document.getElementById('cartTotalPrice');

    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) cartBadge.innerText = totalItems;

    // Update Total Price
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalPrice) cartTotalPrice.innerText = `₹${totalPrice}`;

    // Render Items
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">₹${item.price} x ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    // Update individual item badges on menu buttons
    document.querySelectorAll('.price-box').forEach(btn => {
        const onclickStr = btn.getAttribute('onclick');
        if (onclickStr) {
            const match = onclickStr.match(/'([^']+)'/);
            if (match) {
                const itemName = match[1];
                const cartItem = cart.find(i => i.name === itemName);
                const qty = cartItem ? cartItem.quantity : 0;
                
                let badge = btn.querySelector('.item-count');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'item-count';
                    btn.style.position = 'relative';
                    btn.appendChild(badge);
                }
                
                if (qty > 0) {
                    badge.innerText = qty;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    });
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty! Please add some delicious BBQ first.");
        return;
    }

    const addressInput = document.getElementById('deliveryAddress');
    const address = addressInput ? addressInput.value.trim() : '';

    if (!address) {
        alert("Please enter your delivery address.");
        if(addressInput) addressInput.focus();
        return;
    }

    // Format WhatsApp Message
    let message = "🔥 *NEW ORDER - GUNDU PAIYAN BBQ* 🔥\n\n";
    message += "*Items:*\n";
    
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`;
    });

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total Amount:* ₹${totalPrice}\n\n`;
    
    message += `*Delivery Address:*\n${address}\n\n`;
    message += `Please confirm my order and share your UPI details for payment. Thanks!`;

    // Encode for URL
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "918838578062";
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// --- DOM Ready Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    updateCartUI();

    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when a link is clicked
    const links = document.querySelectorAll('.nav-links li a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-fade-in-up');
    animatedElements.forEach(el => observer.observe(el));
    
    // Navbar Background Change on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(18, 18, 18, 0.9)';
            navbar.style.boxShadow = 'none';
        }
    });
});

// --- Geolocation ---
function getCurrentLocation() {
    const btn = document.getElementById('locationBtn');
    const addressInput = document.getElementById('deliveryAddress');

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
            
            try {
                // Free reverse geocoding using OpenStreetMap
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                
                let readableAddress = data.display_name;
                
                // Set the value in the textarea
                addressInput.value = `${readableAddress}\n\nMap Link: ${mapsLink}`;
                showToast("Location successfully pinned!");
            } catch (error) {
                // Fallback if API fails
                addressInput.value = `My Location: ${mapsLink}\n(Please add your house/flat number)`;
                showToast("Pinned coordinates. Please add details.");
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        },
        (error) => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            alert("Unable to retrieve your location. Please check your browser permissions.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// --- Shop Status ---
function updateShopStatus() {
    const statusDiv = document.getElementById('shopStatus');
    if (!statusDiv) return;

    const now = new Date();
    // Getting current hour in India time (assuming user's local time matches shop's local time)
    const currentHour = now.getHours(); 
    
    // Open from 18:00 (6 PM) to 22:00 (10 PM)
    if (currentHour >= 18 && currentHour < 22) {
        statusDiv.innerText = '🟢 Open Now';
        statusDiv.className = 'shop-status open';
    } else {
        statusDiv.innerText = '🔴 Closed - Opens at 6 PM';
        statusDiv.className = 'shop-status closed';
    }
}

document.addEventListener('DOMContentLoaded', updateShopStatus);
// Update status every minute
setInterval(updateShopStatus, 60000);
