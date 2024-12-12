import { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import EventList from "./EventList";
import MapView from "./MapView";
import { getLatLon } from "../utils/geocoding";

function MainPage() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);

  const handleSearch = async () => {
    try {
      const { lat, lon } = await getLatLon(address);
      setCoords({ lat, lon });
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      alert("Address not found. Please try again.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Search Events
      </Typography>
      <TextField
        label="Postal Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        style={{ marginTop: "10px" }}
      >
        Search
      </Button>
      {coords && (
        <>
          <EventList lat={coords.lat} lon={coords.lon} />
          <MapView lat={coords.lat} lon={coords.lon} />
        </>
      )}
    </Container>
  );
}

export default MainPage;
