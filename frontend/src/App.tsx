import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AboutForests from "./pages/AboutForests";
import ForestDetail from "./pages/ForestDetail";
import Forests from "./pages/Forests";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Results from "./pages/Results";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="predict" element={<Predict />} />
        <Route path="results" element={<Results />} />
        <Route path="forests" element={<Forests />} />
        <Route path="forests/:id" element={<ForestDetail />} />
        <Route path="about" element={<AboutForests />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}