export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Organic Bamboo Baby Towel",
    price: 1250,
    image: "/products/towel.jpg",
    description: "Ultra-soft, hypoallergenic bath towel made from 100% organic bamboo. Gentle on sensitive newborn skin.",
    category: "Bath",
  },
  {
    id: "2",
    name: "Halal Certified Baby Lotion",
    price: 850,
    image: "/products/lotion.jpg",
    description: "Nourishing daily lotion free from alcohol and harsh chemicals. Certified halal and dermatologically tested.",
    category: "Skincare",
  },
  {
    id: "3",
    name: "Silicone Teething Ring",
    price: 450,
    image: "/products/ring.jpg",
    description: "Food-grade, BPA-free silicone teether. Easy for little hands to hold and soothing for sore gums.",
    category: "Toys",
  },
  {
    id: "4",
    name: "Gentle Foaming Baby Wash",
    price: 950,
    image: "/products/facewash.jpg",
    description: "Tear-free, plant-based cleansing foam. Leaves skin and hair soft without stripping natural oils.",
    category: "Bath",
  },
  {
    id: "5",
    name: "Knitted Cotton Blanket",
    price: 2200,
    image: "/products/blanket.jpg",
    description: "A breathable, chunky-knit blanket made from 100% pure cotton for cozy naps.",
    category: "Bedding",
  },
  {
    id: "6",
    name: "Halal Multivitamin Drops",
    price: 1150,
    image: "/products/multivitamins.jpg",
    description: "Essential D3 and vitamins formulated for infants. 100% Halal and alcohol-free.",
    category: "Health",
  },
  {
    id: "7",
    name: "Soft Sole Leather Booties",
    price: 1550,
    image: "/products/bootie.jpg",
    description: "Handcrafted soft leather shoes that allow for natural foot movement and growth.",
    category: "Clothing",
  },
  {
    id: "8",
    name: "Wooden Sensory Blocks",
    price: 1800,
    image: "/products/wood.jpg",
    description: "Non-toxic, sustainably sourced wooden blocks to help develop fine motor skills.",
    category: "Toys",
  }
];