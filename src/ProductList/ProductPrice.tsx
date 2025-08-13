import React from "react";
import "./ProductPrice.scss";
interface ProductPriceProps {
  price: string;
}
const ProductPrice: React.FC<ProductPriceProps> = ({ price }) => {
  return (
    <div className="product-price-container">
      <span className="product-price">${price}</span>
    </div>
  );
};
export default ProductPrice;
