import React from "react";
import "./ProductButtonOptions.scss";

interface ProductButtonOptionsProps {
  addToCart: () => void;
}
const ProductButtonOptions: React.FC<ProductButtonOptionsProps> = ({
  addToCart,
}) => {
  return (
    <div className="product-action-button-container">
      <>
        {Math.random() > 0.5 ? (
          <button className={`qa-atc mfe-button`} onClick={addToCart}>
            + Add to cart
          </button>
        ) : (
          <a className="qa-see-details mfe-button">See Details</a>
        )}
      </>
    </div>
  );
};
export default ProductButtonOptions;
