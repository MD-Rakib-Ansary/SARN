const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_API_BASE_URL;
  }

  const { hostname, protocol } = window.location;

  const isLocalFrontend =
    hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalFrontend) {
    return "http://127.0.0.1:8000/api";
  }

  return `${protocol}//${hostname}:8000/api`;
}

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price?: string | null;
  category: string;
  image?: string | null;
  image_url?: string | null;
  stock: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${getApiBaseUrl()}/products/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProduct(id: string | number): Promise<Product> {
  const response = await fetch(`${getApiBaseUrl()}/products/${id}/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/accounts/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
}

export async function loginUser(data: {
  username: string;
  password: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
}

export async function createOrder(data: any) {
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  if (!accessToken) {
    throw {
      detail: "Please login before placing an order.",
    };
  }

  const response = await fetch(`${getApiBaseUrl()}/orders/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
}