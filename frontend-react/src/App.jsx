import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import ProductDetails from "./ProductDetails";
import AssistantIA from "./AssistantIA";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produit" element={<ProductDetails />} />
        <Route path="/assistant" element={<AssistantIA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;