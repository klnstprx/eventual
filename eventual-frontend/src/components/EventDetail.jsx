import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { Container, Typography, Button } from "@mui/material";

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));
  const userEmail = localStorage.getItem("user_email");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${id}`);
      navigate("/");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    }
  };

  if (!event) return <Typography>Loading...</Typography>;

  const isOrganizer = isAuthenticated && userEmail === event.organizador;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {event.nombre}
      </Typography>
      <Typography variant="subtitle1">
        Organizer: {event.organizador}
      </Typography>
      <Typography variant="body1">
        Date: {new Date(event.timestamp).toLocaleString()}
      </Typography>
      <Typography variant="body1">Location: {event.lugar}</Typography>
      {event.imagen && (
        <img
          src={event.imagen}
          alt="Event"
          style={{ maxWidth: "100%", marginTop: "20px" }}
        />
      )}
      {isOrganizer && (
        <>
          <Button
            component={Link}
            to={`/edit/${event.id}`}
            variant="contained"
            color="primary"
            style={{ marginTop: "10px" }}
          >
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="secondary"
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            Delete
          </Button>
        </>
      )}
    </Container>
  );
}

export default EventDetail;
