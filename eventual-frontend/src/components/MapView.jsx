import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../utils/api";
import L from "leaflet";

function MapView({ lat, lon }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/", {
          params: { lat, lon },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events for map:", error);
      }
    };
    fetchEvents();
  }, [lat, lon]);

  const defaultIcon = L.icon({
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
      .href,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={13}
      style={{ height: "400px", marginTop: "20px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.lat, event.lon]}
          icon={defaultIcon}
        >
          <Popup>
            <strong>{event.nombre}</strong>
            <br />
            {new Date(event.timestamp).toLocaleString()}
            <br />
            {event.lugar}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
