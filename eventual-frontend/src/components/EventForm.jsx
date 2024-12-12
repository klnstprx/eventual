import { useState, useEffect } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

function EventForm() {
  const { id } = useParams();
  const [eventData, setEventData] = useState({
    nombre: "",
    timestamp: "",
    lugar: "",
    imagen: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const response = await api.get(`/events/${id}`);
          setEventData({
            ...response.data,
            timestamp: response.data.timestamp.slice(0, -1),
            imagen: null,
          });
        } catch (error) {
          console.error("Error fetching event data:", error);
        }
      };
      fetchEvent();
    }
  }, [id]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setEventData({ ...eventData, imagen: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData();
    formData.append("nombre", eventData.nombre);
    formData.append("timestamp", eventData.timestamp);
    formData.append("lugar", eventData.lugar);
    if (eventData.imagen) {
      formData.append("image", eventData.imagen);
    }

    try {
      if (id) {
        // Update event
        await api.put(`/events/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create new event
        await api.post("/events/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/");
    } catch (error) {
      console.error("Error submitting event:", error);
      alert("Error submitting event");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {id ? "Edit Event" : "Create Event"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Event Name"
          name="nombre"
          value={eventData.nombre}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Date and Time"
          name="timestamp"
          type="datetime-local"
          value={eventData.timestamp}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Location"
          name="lugar"
          value={eventData.lugar}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="image-upload"
          type="file"
          onChange={handleImageChange}
        />
        <label htmlFor="image-upload">
          <Button
            variant="contained"
            component="span"
            style={{ marginTop: "10px" }}
          >
            {eventData.imagen ? "Change Image" : "Upload Image"}
          </Button>
          {eventData.imagen && (
            <Typography variant="body2" style={{ marginLeft: "10px" }}>
              {eventData.imagen.name}
            </Typography>
          )}
        </label>
        <div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Submit
          </Button>
        </div>
      </form>
    </Container>
  );
}

export default EventForm;
