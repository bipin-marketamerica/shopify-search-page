import React, { useState } from "react";
import "./Product.scss";
import { gql, request } from "graphql-request";
import { Product as IProduct } from "./ProductList";
import Rating from "./Rating";
import Title from "./Title";
import ProductPrice from "./ProductPrice";
import ProductButtonOptions from "./ProductButtonOptions";
import "./Product.scss";
import "../styles/components/_button.scss";

const SHOPIFY_STORE_API_URL =
  "https://mark-mfe-test.myshopify.com/api/2025-07/graphql.json";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = "61b32f60dceb3046271c5892e95bcfdd";

interface ProductProps {
  product: IProduct;
  cartId: string;
  checkoutUrl: string;
  cart: any;
  setCart: (u: any) => void;
  setCheckoutUrl: (u: string) => void;
  cartLinesAddMutation: any;
  loadingCheckout: boolean;
}
const Product: React.FC<ProductProps> = ({
  product,
  cartId,
  checkoutUrl,
  cart,
  setCart,
  setCheckoutUrl,
  cartLinesAddMutation,
  loadingCheckout,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [cartLineItems, setCartLineItems] = useState<any>([]);
  // Function to create a Shopify checkout and redirect the user
  const goToCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setError("Checkout URL not available. Please add items to your cart.");
    }
  };

  // Function to add a product to the cart
  const addToCart = async (product: IProduct) => {
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

  return (
    <div className={`qa-product-card product-container`}>
      <div key={product.node.id} className="product">
        <img
          src={
            product.node.images.edges[0]?.node.url ||
            "https://placehold.co/400x300"
          }
          alt={product.node.title}
          className="w-full h-48 object-cover rounded-md mb-4"
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x300";
          }}
        />

        <div className="product-information">
          <section className="product-data-container">
            <section className="product-header">
              <p className="product-sold-by">
                <>
                  <img
                    className="product-sold-by-icon"
                    src="https://img.shop.com/Image/resources/images/onecart-icon.svg"
                    alt="OneCart Store"
                  />
                  sold by Isotonix
                </>
              </p>
              <div className="product-title-container">
                <Title title={product.node.title} />
              </div>
            </section>
            <div className="product-review">
              <Rating ratingInPercent={90} totalRating={100} />
            </div>
            <section>
              <ProductPrice
                price={
                  parseFloat(
                    product.node.variants.edges[0]?.node.price.amount
                  ).toFixed(2) + ""
                }
              />
            </section>
          </section>
          <ProductButtonOptions addToCart={() => addToCart(product)} />
        </div>
      </div>
    </div>
  );
};
export default Product;
