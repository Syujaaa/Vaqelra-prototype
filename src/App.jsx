import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Worlds from "./pages/Worlds";
import Session from "./pages/Session";
import Feedback from "./pages/Feedback";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/worlds" element={<Worlds />} />
            <Route path="/worlds/:id" element={<Session />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
