import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Research from "./pages/Research";
import Contact from "./pages/Contact";
import Method from "./pages/Method";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/research" element={<Research />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/method" element={<Method />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}