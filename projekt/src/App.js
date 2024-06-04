import { BrowserRouter, Routes, Route } from "react-router-dom";
import Provider from './rendering/Provider';
import NoPage from './nopage/nopage';
import Main from "./main/main";
import Login from "./logging/login";
import Res from "./reservations/reservation";
import Expenses from "./expenses/expenses";
import Incomes from "./incomes/incomes";
import Reports from "./reports/reports";


export default function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
            <Route index element={<Main />} />
            <Route path="/*" element={<NoPage />} />
            <Route path="/log" element={<Login />} />
            <Route path="/reserv" element={<Res />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
