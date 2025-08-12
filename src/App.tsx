import { createRoot } from "react-dom/client";
import ProductList from "./ProductList/ProductList";

const App: React.FC = () => {
  return (
    <div style={{ padding: "0 10px" }}>
      <ProductList />
    </div>
  );
};
export default App;
createRoot(document.getElementById("root")!).render(<App />);
