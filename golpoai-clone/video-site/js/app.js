// Pricing Toggle (Monthly/Annual)
const billingToggle = document.getElementById('billingToggle');
const monthlyPrices = document.querySelectorAll('.monthly-price');
const annualPrices = document.querySelectorAll('.annual-price');

if (billingToggle) {
    billingToggle.addEventListener('change', function() {
        monthlyPrices.forEach(price => {
            price.style.display = this.checked ? 'none' : 'inline';
        });
        annualPrices.forEach(price => {
            price.style.display = this.checked ? 'inline' : 'none';
        });
    });
}

// FAQ Category Switching
const faqCategories = document.querySelectorAll('.faq-category');
const faqSections = document.querySelectorAll('.faq-section');

faqCategories.forEach(category => {
    category.addEventListener('click', function() {
        const targetCategory = this.getAttribute('data-category');

        // Update active category button
        faqCategories.forEach(cat => cat.classList.remove('active'));
        this.classList.add('active');

        // Show corresponding FAQ section
        faqSections.forEach(section => {
            if (section.getAttribute('data-category') === targetCategory) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Close all FAQ items when switching categories
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
    });
});

// FAQ Item Toggle
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all other FAQ items in the same section
        const section = faqItem.closest('.faq-section');
        section.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#signin' && href !== '#demo' && href !== '#getstarted' && href !== '#subscribe' && href !== '#contact') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';

            setTimeout(() => {
                entry.target.style.transition = 'opacity 0.6s, transform 0.6s';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe pricing cards and example cards
document.querySelectorAll('.pricing-card, .example-card').forEach(card => {
    observer.observe(card);
});
