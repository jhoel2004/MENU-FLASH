// ===== FLASH BAR MENU - INTERACTIVE SCRIPT =====

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const response = await fetch('datos.txt?v=' + new Date().getTime());
        const data = await response.json();

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 800);

        // Render menu
        renderMenu(data);

        // Initialize interactions
        initScrollEffects();
        initNavbar();
        initCardInteractions();
        initSearch();

    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('menu-container').innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <p style="color: var(--gold-primary); font-size: 1.2rem;">
                    Error cargando el menú. Por favor, recarga la página.
                </p>
            </div>
        `;
    }
}

// ===== RENDER FUNCTIONS =====

function renderMenu(data) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    data.categories.forEach((category, index) => {
        const section = createSection(category, index);
        container.appendChild(section);
    });

    // Trigger animations after render
    setTimeout(() => {
        observeSections();
    }, 100);
}

function createSection(category, index) {
    const section = document.createElement('section');
    section.className = `menu-section ${category.id}`;
    section.id = category.id;

    let html = `
        <div class="section-header">
            <h2 class="section-title">${category.title}</h2>
            <div class="section-line">
                <span></span>
                <div class="diamond"></div>
                <span></span>
            </div>
        </div>
    `;

    html += '<div class="items-grid">';

    category.items.forEach((item, itemIndex) => {
        html += createCard(item, itemIndex, category.id === 'jarras');
    });

    html += '</div>';

    section.innerHTML = html;
    return section;
}

function createCard(item, index, isSpecial) {
    // Check if it's a slider card (Jarras individuales)
    if (item.isSlider) {
        return createSliderCard(item, index);
    }

    // Check if it's a combo card
    if (item.isCombo) {
        return createComboCard(item, index);
    }

    const hasImage = item.image && item.image !== null;
    const description = item.description || '';
    const delay = index * 0.08;

    let cardClass = 'menu-card';
    if (!hasImage) cardClass += ' text-only';

    let html = `<article class="${cardClass}" style="animation-delay: ${delay}s" data-item="${item.name}">`;

    // Glow element for cursor tracking
    html += `<div class="card-glow"></div>`;

    if (hasImage) {
        html += `
            <div class="card-image-container">
                <img src="${item.image}" alt="${item.name}" class="card-img" loading="lazy">
            </div>
        `;
    }

    html += `
        <div class="card-content">
            ${isSpecial ? '<span class="item-badge">Individual</span>' : ''}
            <h3 class="item-name">${item.name}</h3>
            ${description ? `<p class="item-description">${description}</p>` : ''}
            <div class="item-footer">
                <span class="item-price">${item.price}</span>
                <div class="item-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </div>
            </div>
        </div>
    `;

    html += '</article>';
    return html;
}

function createComboCard(item, index) {
    const variantDots = item.variants.map((_, i) =>
        `<div class="variant-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
    ).join('');

    const html = `
        <article class="combo-card" data-item="${item.name}" data-variants='${JSON.stringify(item.variants)}' data-images='${JSON.stringify(item.images)}'>
            <div class="combo-images-wrapper">
                <div class="combo-images-container">
                    <img src="${item.images[0]}" alt="Jarra 1" class="combo-jar" data-jar="0">
                    <img src="${item.images[0]}" alt="Jarra 2" class="combo-jar" data-jar="1">
                    <img src="${item.images[0]}" alt="Jarra 3" class="combo-jar" data-jar="2">
                </div>
            </div>
            <div class="combo-content">
                <h3 class="combo-title">${item.name}</h3>
                <p class="combo-description">${item.description || ''}</p>
                <div class="combo-variant" id="combo-variant-text">${item.variants[0]}</div>
                <div class="combo-variant-dots">
                    ${variantDots}
                </div>
                <div class="combo-price">${item.price}</div>
            </div>
        </article>
    `;

    // Start the rotation after render
    setTimeout(() => initComboRotation(), 500);

    return html;
}

function createSliderCard(item, index) {
    const firstItem = item.items[0];

    // Convert items to JSON for data attribute
    const sliderData = JSON.stringify(item.items).replace(/"/g, '&quot;');

    const html = `
        <article class="menu-card slider-card" data-slider="${sliderData}" data-description="${item.description || ''}" style="animation-delay: ${index * 0.1}s">
            <div class="card-glow"></div>
            <div class="card-image-container">
                <img src="${firstItem.image}" alt="${firstItem.name}" class="card-img slider-img" loading="lazy">
            </div>

            <div class="card-content">
                <span class="item-badge">Individual</span>
                <h3 class="item-name slider-title">${firstItem.name}</h3>
                <p class="item-description slider-description">${firstItem.description || item.description || ''}</p>
                <div class="item-footer">
                    <span class="item-price">${item.price}</span>
                    <div class="slider-indicators">
                        ${item.items.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
                    </div>
                </div>
            </div>
        </article>
    `;

    // Initialize rotation
    setTimeout(() => initSliderRotation(), 500);

    return html;
}

let sliderInterval = null;

function initSliderRotation() {
    const sliderCard = document.querySelector('.slider-card');
    if (!sliderCard) return;

    const data = JSON.parse(sliderCard.dataset.slider.replace(/&quot;/g, '"'));
    const img = sliderCard.querySelector('.slider-img');
    const title = sliderCard.querySelector('.slider-title');
    const desc = sliderCard.querySelector('.slider-description');
    const dots = sliderCard.querySelectorAll('.slider-dot');

    let currentIndex = 0;

    if (sliderInterval) clearInterval(sliderInterval);

    sliderInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % data.length;
        const currentItem = data[currentIndex];

        // Animate out
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9) translateY(5px)';
        title.style.opacity = '0';
        title.style.transform = 'translateY(-5px)';
        if (desc) {
            desc.style.opacity = '0';
            desc.style.transform = 'translateY(-3px)';
        }

        setTimeout(() => {
            // Update content
            img.src = currentItem.image;
            title.textContent = currentItem.name;
            if (desc) desc.textContent = currentItem.description || '';

            // Update dots
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));

            // Animate in
            img.style.opacity = '1';
            img.style.transform = 'scale(1) translateY(0)';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            if (desc) {
                desc.style.opacity = '1';
                desc.style.transform = 'translateY(0)';
            }
        }, 350);

    }, 2500); // 2.5 seconds interval
}

// Combo variant rotation
let comboInterval = null;
let currentVariantIndex = 0;

function initComboRotation() {
    const comboCard = document.querySelector('.combo-card');
    if (!comboCard) return;

    const variants = JSON.parse(comboCard.dataset.variants);
    const images = JSON.parse(comboCard.dataset.images);

    // Clear existing interval
    if (comboInterval) clearInterval(comboInterval);

    // Rotate every 3 seconds
    comboInterval = setInterval(() => {
        currentVariantIndex = (currentVariantIndex + 1) % variants.length;
        updateComboVariant(variants, images, currentVariantIndex);
    }, 3000);
}

function updateComboVariant(variants, images, index) {
    const variantText = document.getElementById('combo-variant-text');
    const jars = document.querySelectorAll('.combo-jar');
    const dots = document.querySelectorAll('.variant-dot');

    if (!variantText || !jars.length) return;

    // Slide out effect
    jars.forEach(jar => {
        jar.style.opacity = '0';
        jar.style.transform += ' translateX(10px) scale(0.85)';
    });

    // Update variant text with animation
    variantText.style.animation = 'none';
    variantText.offsetHeight; // Trigger reflow
    variantText.textContent = variants[index];
    variantText.style.animation = 'pulseVariant 0.5s ease';

    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Update jar images with smooth transition
    setTimeout(() => {
        if (index === 0) {
            jars.forEach(jar => jar.src = images[0]);
        } else if (index === 1) {
            jars.forEach(jar => jar.src = images[1]);
        } else if (index === 2) {
            jars.forEach(jar => jar.src = images[2]);
        } else {
            jars[0].src = images[0];
            jars[1].src = images[1];
            jars[2].src = images[2];
        }

        // Reset and slide in
        setTimeout(() => {
            jars[0].style.transform = 'rotate(-8deg) translateY(10px)';
            jars[1].style.transform = 'scale(1.1) translateY(-5px)';
            jars[2].style.transform = 'rotate(8deg) translateY(10px)';
            jars.forEach(jar => {
                jar.style.opacity = '1';
            });
        }, 50);
    }, 350);
}

// ===== SCROLL EFFECTS =====

function initScrollEffects() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function scrollToMenu() {
    const menuSection = document.getElementById('jarras');
    if (menuSection) {
        const offset = 80;
        const targetPosition = menuSection.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Make scrollToMenu globally available
window.scrollToMenu = scrollToMenu;

// ===== NAVBAR =====

function initNavbar() {
    const navbar = document.getElementById('navbar');

    // Initial check
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar logic
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hero Logo Fade Out Effect
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const opacity = Math.max(0, 1 - (scrollY / (window.innerHeight * 0.7)));
            heroSection.style.opacity = opacity;

            if (opacity <= 0) {
                heroSection.style.visibility = 'hidden';
            } else {
                heroSection.style.visibility = 'visible';
            }
        }

        // Update active section state
        updateActiveSection();
    }, { passive: true });
}

function updateActiveSection() {
    const sections = document.querySelectorAll('.menu-section');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentId = '';
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentId = section.getAttribute('id');
        }
    });

    if (currentId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');

                link.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        });
    }
}

// ===== INTERSECTION OBSERVER =====

function observeSections() {
    const sections = document.querySelectorAll('.menu-section');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
    });

    sections.forEach(section => revealObserver.observe(section));
}

// ===== CARD INTERACTIONS =====

function initCardInteractions() {
    // Add ripple effect on click
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-card');
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);

            console.log('Selected:', card.dataset.item);
        }
    });

    // Tilt + Glow effect on hover (desktop only)
    if (window.matchMedia('(min-width: 768px)').matches) {
        document.addEventListener('mousemove', handleGlobalCardGlow);

        document.querySelectorAll('.menu-card').forEach(card => {
            card.addEventListener('mousemove', handleTilt);
            card.addEventListener('mouseleave', resetTilt);
        });
    }
}

function handleTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;

    // Update glow position
    const glow = card.querySelector('.card-glow');
    if (glow) {
        glow.style.opacity = '1';
        glow.style.left = `${(x / rect.width) * 100}%`;
        glow.style.top = `${(y / rect.height) * 100}%`;
    }
}

function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform = '';

    const glow = card.querySelector('.card-glow');
    if (glow) {
        glow.style.opacity = '0';
    }
}

function handleGlobalCardGlow(e) {
    // This allows glow on dynamically added cards
}

// ===== PARALLAX LOGO =====
document.addEventListener('mousemove', (e) => {
    const logo = document.getElementById('main-logo');
    if (!logo) return;

    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    logo.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchContainer');
    if (!searchInput || !searchToggle || !searchContainer) return;

    // Toggle search open/close
    searchToggle.addEventListener('click', () => {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
        } else {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    });

    // Close on Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchContainer.classList.remove('active');
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchContainer.classList.remove('active');
        }
    });

    // Filter products
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.menu-card, .combo-card');
        const sections = document.querySelectorAll('.menu-section');

        cards.forEach(card => {
            const title = card.querySelector('.item-name, .combo-title, .slider-title');
            const description = card.querySelector('.item-description, .combo-description, .slider-description');

            const name = title ? title.textContent.toLowerCase() : '';
            const desc = description ? description.textContent.toLowerCase() : '';
            const combined = name + ' ' + desc;

            if (combined.includes(searchTerm)) {
                card.style.display = '';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });

        // Hide empty sections
        sections.forEach(section => {
            const visibleCards = Array.from(section.querySelectorAll('.menu-card, .combo-card')).filter(card => card.style.display !== 'none');
            if (visibleCards.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = '';
            }
        });
    });
}
