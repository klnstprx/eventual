import { useEffect, useState } from "react";
import api from "../utils/api";
import { List, ListItem, ListItemText, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function EventList({ lat, lon }) {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/", {
          params: { lat, lon },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [lat, lon]);

  return (
    <List>
      {events.map((event) => (
        <ListItem key={event.id} divider>
          <ListItemText
            primary={event.nombre}
            secondary={`Organizer: ${event.organizador}`}
          />
          <Button
            onClick={() => navigate(`/events/${event.id}`)}
            variant="contained"
          >
            Details
          </Button>
        </ListItem>
      ))}
    </List>
  );
}

export default EventList;
