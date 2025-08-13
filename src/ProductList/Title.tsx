import React from "react";
import "./Title.scss";
interface TitleProps {
  title: string;
  shouldOpenInNewTab?: boolean;
  productLinkUrl?: string;
}
const Title: React.FC<TitleProps> = React.memo(
  ({ title, shouldOpenInNewTab = false, productLinkUrl = "" }) => {
    return (
      <>
        <a
          className="qa-product-title title-anchor"
          href={productLinkUrl}
          target={shouldOpenInNewTab ? "_blank" : "_self"}
          rel={shouldOpenInNewTab ? "noopener noreferrer" : undefined}
        >
          <span
            className="title"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          ></span>
          <span
            className="tooltip-title"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          ></span>
        </a>
      </>
    );
  }
);
export default Title;
