import { BrowserRouter, Routes, Route } from "react-router-dom";
import Provider from './rendering/Provider';
import NoPage from './nopage/nopage';
import Main from "./main/main";
import Login from "./logging/login";
import Res from "./reservations/reservation";
import Reviews from "./review/review";


export default function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
            <Route index element={<Main />} />
            <Route path="/*" element={<NoPage />} />
            <Route path="/log" element={<Login />} />
            <Route path="/reserv" element={<Res />} />
            <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
