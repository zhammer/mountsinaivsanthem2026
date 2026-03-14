import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import TestimonialsPage from "./TestimonialsPage";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
    </Routes>
    <Analytics />
  </BrowserRouter>
);
