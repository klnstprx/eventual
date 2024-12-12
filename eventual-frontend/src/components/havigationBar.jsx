import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

function NavigationBar() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
        >
          Eventual
        </Typography>
        {isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/create">
              Create Event
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavigationBar;
