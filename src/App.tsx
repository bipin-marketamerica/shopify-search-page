import { createRoot } from "react-dom/client";
import ProductList from "./ProductList/ProductList";

const App: React.FC = () => {
  const gotoCart = (id: string) => {};
  return (
    <div style={{ padding: "0 10px" }}>
      <ProductList gotoCart={gotoCart} />
    </div>
  );
};
export default App;
createRoot(document.getElementById("root")!).render(<App />);
