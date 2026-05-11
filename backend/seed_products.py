from products.models import Product

products = [
    {
        "name": "Organic Bamboo Baby Towel",
        "price": 1250,
        "old_price": 1450,
        "image": "products/towel.jpg",
        "description": "Ultra-soft, hypoallergenic bath towel made from 100% organic bamboo. Gentle on sensitive newborn skin.",
        "category": "Bath",
        "stock": 20,
        "is_featured": True,
    },
    {
        "name": "Halal Certified Baby Lotion",
        "price": 850,
        "old_price": 1050,
        "image": "products/lotion.jpg",
        "description": "Nourishing daily lotion free from alcohol and harsh chemicals. Certified halal and dermatologically tested.",
        "category": "Skincare",
        "stock": 25,
        "is_featured": True,
    },
    {
        "name": "Silicone Teething Ring",
        "price": 450,
        "old_price": 550,
        "image": "products/ring.jpg",
        "description": "Food-grade, BPA-free silicone teether. Easy for little hands to hold and soothing for sore gums.",
        "category": "Toys",
        "stock": 30,
        "is_featured": False,
    },
    {
        "name": "Gentle Foaming Baby Wash",
        "price": 950,
        "old_price": 1150,
        "image": "products/facewash.jpg",
        "description": "Tear-free, plant-based cleansing foam. Leaves skin and hair soft without stripping natural oils.",
        "category": "Bath",
        "stock": 18,
        "is_featured": True,
    },
    {
        "name": "Knitted Cotton Blanket",
        "price": 2200,
        "old_price": 2500,
        "image": "products/blanket.jpg",
        "description": "A breathable, chunky-knit blanket made from 100% pure cotton for cozy naps.",
        "category": "Bedding",
        "stock": 12,
        "is_featured": True,
    },
    {
        "name": "Halal Multivitamin Drops",
        "price": 1150,
        "old_price": 1350,
        "image": "products/multivitamins.jpg",
        "description": "Essential D3 and vitamins formulated for infants. 100% halal and alcohol-free.",
        "category": "Health",
        "stock": 16,
        "is_featured": False,
    },
    {
        "name": "Soft Sole Leather Booties",
        "price": 1550,
        "old_price": 1800,
        "image": "products/bootie.jpg",
        "description": "Handcrafted soft leather shoes that allow for natural foot movement and growth.",
        "category": "Clothing",
        "stock": 14,
        "is_featured": False,
    },
    {
        "name": "Wooden Sensory Blocks",
        "price": 1800,
        "old_price": 2100,
        "image": "products/wood.jpg",
        "description": "Non-toxic, sustainably sourced wooden blocks to help develop fine motor skills.",
        "category": "Toys",
        "stock": 10,
        "is_featured": True,
    },
]

for item in products:
    product, created = Product.objects.update_or_create(
        name=item["name"],
        defaults={
            "description": item["description"],
            "price": item["price"],
            "old_price": item["old_price"],
            "category": item["category"],
            "image": item["image"],
            "stock": item["stock"],
            "is_featured": item["is_featured"],
        },
    )

    print(("Created" if created else "Updated"), "-", product.name)

print("Done seeding products.")