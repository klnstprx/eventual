import { useEffect } from "react";
import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("access_token");
    if (accessToken) {
      const decoded = jwt_decode(accessToken);
      const email = decoded.sub;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user_email", email);
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Sign in with Google
      </Button>
    </Container>
  );
}

export default Login;
