"""
Management command to seed the database with the initial product catalog,
categories, and testimonials from the React frontend's hardcoded data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --clear   # wipe and re-seed
"""
from django.core.management.base import BaseCommand
from products.models import Category, Product, ProductSpecification, ProductFeature
from core.models import Testimonial, SiteSettings


CATEGORIES = [
    {'name': 'Sport Bikes', 'sort_order': 1},
    {'name': 'Cruisers', 'sort_order': 2},
    {'name': 'Adventure', 'sort_order': 3},
    {'name': 'Racing', 'sort_order': 4},
    {'name': 'Vintage', 'sort_order': 5},
    {'name': 'Electric', 'sort_order': 6},
    {'name': 'Helmets', 'sort_order': 7},
    {'name': 'Jackets', 'sort_order': 8},
    {'name': 'Gloves', 'sort_order': 9},
    {'name': 'Parts & Accessories', 'sort_order': 10},
]

PRODUCTS = [
    {
        'name': 'Speedster Sport X1',
        'category': 'Sport Bikes',
        'price': 12999,
        'original_price': None,
        'description': 'The ultimate sport bike for track and street. Featuring a powerful inline-4 engine, aerodynamic fairing, and precision handling for the most demanding riders.',
        'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'stock': 5,
        'is_featured': True,
        'is_new': False,
        'rating': 4.8,
        'review_count': 124,
        'features': [
            'Inline-4 cylinder engine',
            'Aerodynamic full fairing',
            'Quick-shift gearbox',
            'Launch control system',
            'Traction control & ABS',
        ],
        'specs': [
            ('Engine', '998cc Inline-4'),
            ('Power', '189 HP'),
            ('Torque', '113 Nm'),
            ('Weight', '193 kg'),
            ('Top Speed', '299 km/h'),
            ('Fuel Tank', '17 L'),
        ],
    },
    {
        'name': 'Classic Cruiser 500',
        'category': 'Cruisers',
        'price': 7499,
        'original_price': 9999,
        'description': 'Timeless cruiser styling meets modern reliability. Perfect for long highway miles and weekend rides with classic V-twin character.',
        'image_url': 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800',
        'stock': 8,
        'is_featured': True,
        'is_new': False,
        'rating': 4.6,
        'review_count': 89,
        'features': [
            'V-Twin engine with classic sound',
            'Low seat height for comfort',
            'Chrome accents and classic styling',
            'Wide handlebars for relaxed riding',
            'Spoke wheels with whitewalls',
        ],
        'specs': [
            ('Engine', '745cc V-Twin'),
            ('Power', '65 HP'),
            ('Torque', '68 Nm'),
            ('Weight', '230 kg'),
            ('Seat Height', '695 mm'),
            ('Fuel Tank', '15 L'),
        ],
    },
    {
        'name': 'Adventure Pro 800',
        'category': 'Adventure',
        'price': 14999,
        'original_price': None,
        'description': 'Conquer any terrain with the Adventure Pro 800. Built for long-distance touring and off-road exploration with advanced electronics and massive fuel range.',
        'image_url': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
        'stock': 4,
        'is_featured': True,
        'is_new': False,
        'rating': 4.9,
        'review_count': 156,
        'features': [
            'Parallel-twin adventure engine',
            'Adjustable suspension front & rear',
            'Cornering ABS and traction control',
            'Large 30L panniers capacity',
            'Heated grips and seat',
            'Navigation system ready',
        ],
        'specs': [
            ('Engine', '799cc Parallel-Twin'),
            ('Power', '95 HP'),
            ('Torque', '83 Nm'),
            ('Weight', '220 kg'),
            ('Seat Height', '850 mm'),
            ('Fuel Tank', '23 L'),
        ],
    },
    {
        'name': 'Racer Elite R1',
        'category': 'Racing',
        'price': 18999,
        'original_price': None,
        'description': 'Purpose-built track weapon. Every component optimised for lap time. Street-legal but track-focused with racing DNA in every component.',
        'image_url': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
        'stock': 3,
        'is_featured': True,
        'is_new': False,
        'rating': 4.7,
        'review_count': 67,
        'features': [
            'Race-derived inline-4 engine',
            'Full Öhlins suspension',
            'Carbon fibre body panels',
            'Brembo race brakes',
            'Quick-shifter with auto-blipper',
            'Data logging system',
        ],
        'specs': [
            ('Engine', '1000cc Inline-4'),
            ('Power', '214 HP'),
            ('Torque', '118 Nm'),
            ('Weight', '186 kg'),
            ('Top Speed', '320+ km/h'),
            ('Fuel Tank', '17 L'),
        ],
    },
    {
        'name': 'Vintage Classic 350',
        'category': 'Vintage',
        'price': 5999,
        'original_price': 7999,
        'description': 'Retro styling with modern mechanics. A head-turner everywhere you go, combining old-school aesthetics with modern reliability and everyday usability.',
        'image_url': 'https://images.unsplash.com/photo-1558618047-f4e72cc37d48?w=800',
        'stock': 12,
        'is_featured': False,
        'is_new': False,
        'rating': 4.5,
        'review_count': 203,
        'features': [
            'Classic single-cylinder thumper',
            'Retro round headlight',
            'Drum rear brake for authenticity',
            'Leather saddle seat',
            'Chrome exhaust pipe',
        ],
        'specs': [
            ('Engine', '349cc Single-Cylinder'),
            ('Power', '20 HP'),
            ('Torque', '28 Nm'),
            ('Weight', '195 kg'),
            ('Seat Height', '800 mm'),
            ('Fuel Tank', '13 L'),
        ],
    },
    {
        'name': 'E-Rider Future',
        'category': 'Electric',
        'price': 11999,
        'original_price': None,
        'description': 'Zero emissions, zero compromise. The future of motorcycling is here with instant torque, silent performance and cutting-edge connected technology.',
        'image_url': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
        'stock': 6,
        'is_featured': True,
        'is_new': True,
        'rating': 4.4,
        'review_count': 45,
        'features': [
            'Zero emissions electric motor',
            'Fast charging (0-80% in 40 min)',
            'Connected app for ride stats',
            'Regenerative braking',
            'Multiple riding modes',
            'Over-the-air updates',
        ],
        'specs': [
            ('Motor', '75 kW Electric'),
            ('Power', '100 HP equiv.'),
            ('Torque', '200 Nm'),
            ('Range', '250 km'),
            ('Charge Time', '40 min (fast)'),
            ('Weight', '210 kg'),
        ],
    },
    {
        'name': 'Carbon Fiber Helmet Pro',
        'category': 'Helmets',
        'price': 599,
        'original_price': None,
        'description': 'Lightweight carbon fibre shell with advanced ventilation and noise reduction. ECE 22.06 certified for maximum protection at minimum weight.',
        'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'stock': 25,
        'is_featured': False,
        'is_new': True,
        'rating': 4.7,
        'review_count': 312,
        'features': [
            'Full carbon fibre outer shell',
            'Multi-density EPS liner',
            'Pinlock 120 anti-fog visor',
            'Emergency Quick Release (EQR)',
            'Bluetooth ready speaker pockets',
        ],
        'specs': [
            ('Certification', 'ECE 22.06 / DOT'),
            ('Weight', '1,250 g'),
            ('Shell', 'Carbon Fibre'),
            ('Visor', 'Pinlock 120'),
            ('Sizes', 'XS – XXL'),
            ('Ventilation', '12 intakes / 6 exhausts'),
        ],
    },
    {
        'name': 'Premium Leather Jacket',
        'category': 'Jackets',
        'price': 449,
        'original_price': None,
        'description': 'Full-grain leather jacket with CE Level 2 armour at shoulders, elbows and back. Timeless style with maximum protection.',
        'image_url': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
        'stock': 30,
        'is_featured': False,
        'is_new': True,
        'rating': 4.8,
        'review_count': 178,
        'features': [
            '1.2 mm full-grain leather',
            'CE Level 2 armour included',
            'Thermal removable lining',
            'Reflective piping for visibility',
            'Dual entry pockets',
        ],
        'specs': [
            ('Material', 'Full-Grain Leather'),
            ('Armour', 'CE Level 2'),
            ('Sizes', 'XS – 4XL'),
            ('Lining', 'Removable thermal'),
            ('Pockets', '4 external, 2 internal'),
            ('Certification', 'EN 13595'),
        ],
    },
    {
        'name': 'Racing Gloves Pro',
        'category': 'Gloves',
        'price': 129,
        'original_price': None,
        'description': 'Short-cuff racing gloves with hard knuckle protection and touchscreen-compatible fingertips. Designed for sport and track riding.',
        'image_url': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
        'stock': 50,
        'is_featured': False,
        'is_new': True,
        'rating': 4.5,
        'review_count': 94,
        'features': [
            'Hard carbon knuckle protector',
            'Touchscreen compatible fingertips',
            'Ventilated leather palm',
            'Silicon grip panels',
            'Micro-adjustment wrist strap',
        ],
        'specs': [
            ('Material', 'Leather / Mesh'),
            ('Knuckle', 'Hard carbon protector'),
            ('Sizes', 'S – 2XL'),
            ('Certification', 'EN 13594 Level 1'),
            ('Cuff', 'Short sport cut'),
        ],
    },
    {
        'name': 'Performance Exhaust Kit',
        'category': 'Parts & Accessories',
        'price': 899,
        'original_price': None,
        'description': 'Stainless steel full exhaust system that adds 8-12 HP and saves 4 kg versus stock. Includes all mounting hardware and a 1-year warranty.',
        'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'stock': 15,
        'is_featured': False,
        'is_new': True,
        'rating': 4.6,
        'review_count': 57,
        'features': [
            'Stainless steel headers',
            'Titanium muffler end-can',
            '8-12 HP power gain',
            '-4 kg weight saving',
            'Deep sport exhaust note',
        ],
        'specs': [
            ('Material', 'Stainless / Titanium'),
            ('Power Gain', '+8-12 HP'),
            ('Weight Saving', '-4 kg'),
            ('Fitment', 'Universal slip-on / full system'),
            ('Warranty', '1 year'),
        ],
    },
    {
        'name': 'Speedster Sport X1 — Sale Edition',
        'category': 'Sport Bikes',
        'price': 9999,
        'original_price': 12999,
        'description': 'Last year\'s model Speedster Sport X1 at a massive discount. Same great performance, unbeatable value.',
        'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'stock': 2,
        'is_featured': False,
        'is_new': False,
        'rating': 4.8,
        'review_count': 88,
        'features': [
            'Inline-4 cylinder engine',
            'Aerodynamic full fairing',
            'Quick-shift gearbox',
            'Traction control & ABS',
        ],
        'specs': [
            ('Engine', '998cc Inline-4'),
            ('Power', '189 HP'),
            ('Torque', '113 Nm'),
            ('Weight', '193 kg'),
            ('Top Speed', '299 km/h'),
        ],
    },
]

TESTIMONIALS = [
    {
        'name': 'Mike Johnson',
        'location': 'California, USA',
        'rating': 5,
        'text': 'Amazing selection and fast shipping! My new Adventure Pro arrived in perfect condition. MotoRide is now my go-to for all motorcycle gear.',
        'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        'sort_order': 1,
    },
    {
        'name': 'Sarah Williams',
        'location': 'Texas, USA',
        'rating': 5,
        'text': 'The leather jacket I bought is absolutely top quality. The sizing guide was accurate and customer service was incredibly helpful.',
        'avatar_url': 'https://images.unsplash.com/photo-1494790108755-2616b612b9c0?w=150',
        'sort_order': 2,
    },
    {
        'name': 'Carlos Rodriguez',
        'location': 'Florida, USA',
        'rating': 5,
        'text': 'Best price I found online for the Carbon Fiber Helmet. Genuine product, fast delivery, and it fits perfectly. Highly recommended!',
        'avatar_url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        'sort_order': 3,
    },
]


class Command(BaseCommand):
    help = 'Seed the database with initial product catalog, categories, and testimonials'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Product.objects.all().delete()
            Category.objects.all().delete()
            Testimonial.objects.all().delete()

        self.stdout.write('Seeding categories...')
        category_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'sort_order': cat_data['sort_order']}
            )
            category_map[cat.name] = cat
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  {status}: {cat.name}')

        self.stdout.write('Seeding products...')
        for product_data in PRODUCTS:
            specs = product_data.pop('specs')
            features = product_data.pop('features')
            category_name = product_data.pop('category')

            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    **product_data,
                    'category': category_map[category_name],
                }
            )

            if created:
                for i, (label, value) in enumerate(specs):
                    ProductSpecification.objects.create(product=product, label=label, value=value, sort_order=i)
                for i, feature in enumerate(features):
                    ProductFeature.objects.create(product=product, feature=feature, sort_order=i)
                self.stdout.write(f'  Created: {product.name}')
            else:
                self.stdout.write(f'  Already exists: {product.name}')

        self.stdout.write('Seeding testimonials...')
        for t_data in TESTIMONIALS:
            t, created = Testimonial.objects.get_or_create(
                name=t_data['name'],
                defaults=t_data
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  {status}: {t.name}')

        self.stdout.write('Initialising site settings...')
        SiteSettings.get()

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(self.style.SUCCESS(f'  {len(CATEGORIES)} categories'))
        self.stdout.write(self.style.SUCCESS(f'  {len(PRODUCTS)} products'))
        self.stdout.write(self.style.SUCCESS(f'  {len(TESTIMONIALS)} testimonials'))
