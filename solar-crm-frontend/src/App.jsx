import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddLead from "./pages/AddLead";
import LeadsList from "./pages/LeadsList";
import LeadDetail from "./pages/LeadDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeadsList />} />
        <Route path="/add-lead" element={<AddLead />} />
        <Route path="/lead/:id" element={<LeadDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;