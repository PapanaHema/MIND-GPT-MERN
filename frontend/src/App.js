import Main from "./components/main/Main";
import Sidebar from "./components/sidebar/Sidebar";
import Auth from "./components/auth/Auth";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  if (!user) return <Auth />;

  return (
    <>
      <Sidebar />
      <Main />
    </>
  );
};

export default App;
