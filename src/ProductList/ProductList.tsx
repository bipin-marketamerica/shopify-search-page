import React, { useState, useEffect } from "react";
import "../index.css";
import { gql, request } from "graphql-request";
import Product from "./Product";
import "./ProductList.scss";

const SHOPIFY_STORE_API_URL =
  "https://mark-mfe-test.myshopify.com/api/2025-07/graphql.json";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = "61b32f60dceb3046271c5892e95bcfdd";

// GraphQL query to fetch products
const productsQuery = `{
    products(first: 20) {
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

            quantity
            merchandise {
              ... on ProductVariant {
                id
                title

                price {
                  amount
                }
                image {
                  url
                }
                product {
                  id
                  title
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
      }
      checkoutUrl
    }
  }
`;

interface ProductListProps {
  gotoCart: (id: string) => void;
}

export interface Product {
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

const ProductList: React.FC<ProductListProps> = ({ gotoCart }) => {
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

  if (loadingProducts)
    return <div className="p-8 text-center text-lg">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Our Products</h1>

      <div className="product-list-container">
        {products.map(({ node: product }: Product) => (
          <Product
            product={{ node: product }}
            cartId={cartId}
            checkoutUrl={checkoutUrl}
            cart={cart}
            setCart={setCart}
            setCheckoutUrl={setCheckoutUrl}
            cartLinesAddMutation={cartLinesAddMutation}
            loadingCheckout={loadingCheckout}
          />
        ))}
      </div>

      {cartId && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-bold">{cart.length} items in cart</p>

          {cart.length > 0 && (
            <button
              onClick={() => gotoCart(cartId)}
              disabled={loadingCheckout}
              className="mt-2 bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {"View Cart"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default ProductList;
