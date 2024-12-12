import { Routes, Route } from "react-router-dom";
import NavigationBar from "./components/havigationBar";
import MainPage from "./components/MainPage";
import EventDetail from "./components/EventDetail";
import EventForm from "./components/EventForm";
import Login from "./components/Login";

function App() {
  return (
    <>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create" element={<EventForm />} />
        <Route path="/edit/:id" element={<EventForm />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
