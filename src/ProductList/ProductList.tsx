import React, { useState, useEffect } from "react";
import "../index.css";
import { gql, request } from "graphql-request";

const SHOPIFY_STORE_API_URL =
  "https://bip-test-store.myshopify.com/api/2025-07/graphql.json";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = "575fe4f4550d0eb9789b80cec5fa537d";

// GraphQL query to fetch products
const productsQuery = `{
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                }
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }`;

const cartQuery = gql`
  query cartQuery($cartId: ID!) {
    cart(id: $cartId) {
      id
      lines(first: 10) {
        edges {
          node {
            id
          }
        }
      }
      checkoutUrl
    }
  }
`;

interface ProductListProps {}

interface Product {
  node: {
    id: string;
    title: string;
    description: string;
    variants: {
      edges: [
        {
          node: {
            id: string;
            price: {
              amount: string;
            };
          };
        }
      ];
    };
    images: {
      edges: [
        {
          node: { url: string };
        }
      ];
    };
  };
}

const cartCreateMutation = `
mutation cartCreate {
  cartCreate {
    cart {
      id
      lines(first: 10) {
        edges {
          node {
            id
          }
        }
      }
      checkoutUrl
    }
  }
}
`;

const cartLinesAddMutation = `
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      lines(first: 10) {
        edges {
          node {
            id
          }
        }
      }
      checkoutUrl
    }
    userErrors {
      message
    }
  }
}
`;

const ProductList: React.FC<ProductListProps> = () => {
  const [products, setProducts] = useState([]);
  const [cartId, setCartId] = useState<string>("");
  const [cart, setCart] = useState<any>([]);
  const [cartLineItems, setCartLineItems] = useState<any>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await request(
          SHOPIFY_STORE_API_URL,
          productsQuery,
          {},
          {
            "X-Shopify-Storefront-Access-Token":
              SHOPIFY_STOREFRONT_ACCESS_TOKEN,
          }
        );
        // @ts-ignore
        setProducts(data.products.edges);
      } catch (err) {
        setError(
          "Failed to fetch products. Please check your API credentials."
        );
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    console.log("cartid", cartId);
    console.log("change in cart", cart);
  }, [cart]);

  // Check for existing cart or create a new one on component mount
  useEffect(() => {
    const initializeCart = async () => {
      let currentCartId = localStorage.getItem("shopifyCartId");

      if (!currentCartId) {
        // No cart ID found, create a new cart
        try {
          const data: any = await request(
            SHOPIFY_STORE_API_URL,
            cartCreateMutation,
            {},
            {
              "X-Shopify-Storefront-Access-Token":
                SHOPIFY_STOREFRONT_ACCESS_TOKEN,
            }
          );
          currentCartId = data.cartCreate.cart.id;
          localStorage.setItem("shopifyCartId", currentCartId!);
          setCart(data.cartCreate.cart);
        } catch (err) {
          setError(
            "Failed to create a new cart. Please check your API permissions."
          );
          console.error(err);
        }
      } else {
        // get cart data
        const fetchCartById = async () => {
          try {
            const data: any = await request(
              SHOPIFY_STORE_API_URL,
              cartQuery,
              {
                cartId: currentCartId,
              },
              {
                "X-Shopify-Storefront-Access-Token":
                  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
              }
            );
            if (data.cart) {
              setCart(data.cart.lines.edges);
              setCheckoutUrl(data.cart.checkoutUrl);
            }
          } catch (err) {
            setError(
              "Failed to load cart data. Please check your API permissions."
            );
            console.error(err);
          }
        };
        fetchCartById();
      }
      setCartId(currentCartId!);
    };
    initializeCart();
  }, []);

  // Function to add a product to the cart
  const addToCart = async (product: Product) => {
    if (!cartId) {
      setError("Cart not yet initialized. Please try again in a moment.");
      return;
    }

    const lineItems = [
      {
        merchandiseId: product.node.variants.edges[0]?.node.id,
        quantity: 1,
      },
    ];

    try {
      const data: any = await request(
        SHOPIFY_STORE_API_URL,
        cartLinesAddMutation,
        { cartId: cartId, lines: lineItems },
        { "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN }
      );
      if (
        data.cartLinesAdd.userErrors &&
        data.cartLinesAdd.userErrors.length > 0
      ) {
        setError(
          data.cartLinesAdd.userErrors.map((e: any) => e.message).join(", ")
        );
        console.error(data.cartLinesAdd.userErrors);
        return;
      }
      setCart(data.cartLinesAdd.cart.lines.edges);
      setCheckoutUrl(data.cartLinesAdd.cart.checkoutUrl);
      setCartLineItems(data.cartLinesAdd.cart.lines.edges.length);
    } catch (err) {
      setError(
        "Failed to add item to cart. Please check your API permissions."
      );
      console.error(err);
    }
  };

  // Function to create a Shopify checkout and redirect the user
  const goToCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setError("Checkout URL not available. Please add items to your cart.");
    }
  };

  if (loadingProducts)
    return <div className="p-8 text-center text-lg">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(({ node: product }: Product) => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-lg shadow-lg flex flex-col"
          >
            <img
              src={
                product.images.edges[0]?.node.url ||
                "https://placehold.co/400x300"
              }
              alt={product.title}
              className="w-full h-48 object-cover rounded-md mb-4"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x300";
              }}
            />
            <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
            <p className="text-gray-700 mb-4 flex-grow">
              {product.description}
            </p>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-2xl font-bold text-gray-900">
                $
                {parseFloat(
                  product.variants.edges[0]?.node.price.amount
                ).toFixed(2)}
              </span>
              Add to cart
              <button
                onClick={() => addToCart({ node: product })}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      {cartId && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-bold">{cart.length} items in cart</p>
          Checkout
          {cart.length > 0 && (
            <button
              onClick={goToCheckout}
              disabled={loadingCheckout}
              className="mt-2 bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loadingCheckout ? "Creating checkout..." : "Go to Checkout"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default ProductList;
