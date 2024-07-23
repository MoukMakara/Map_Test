import React, { useEffect, useState, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapCameraChangedEvent,
  Pin,
  Marker,
} from "@vis.gl/react-google-maps";
import type { Marker } from "@googlemaps/markerclusterer";

// 6. Add markers to the map
type Poi = { key: string; location: google.maps.LatLngLiteral };
const locations: Poi[] = [
  {
    key: "T-Soccer",
    location: { lat: 11.58603815946927, lng: 104.90250606361631 },
  },
  { key: "Sony Sport Club", location: { lat: 11.5736576, lng: 104.9133056 } },
  { key: "Down Town Sport", location: { lat: 11.551841, lng: 104.900934 } },
  {
    key: "PhanRong Sport",
    location: { lat: 11.573727628331069, lng: 104.82179080969664 },
  },
  {
    key: "Happy Sports Cambodia",
    location: { lat: 11.53914874749284, lng: 104.85660960732177 },
  },
];

const App = () => (
  <APIProvider
    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
    onLoad={() => console.log("Maps API has loaded.")}
  >
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: 11.578268759952971, lng: 104.90178553000196 }}
      mapId="a2b2fd561b553426"
      onCameraChanged={(ev: MapCameraChangedEvent) =>
        console.log(
          "camera changed:",
          ev.detail.center,
          "zoom:",
          ev.detail.zoom
        )
      }
    >
      {" "}
      <PoiMarkers pois={locations} />
    </Map>
  </APIProvider>
);

const PoiMarkers = (props: { pois: Poi[] }) => {
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [distances, setDistances] = useState<{ [key: string]: number }>({});

  // Get the current location when the component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };
          setCurrentLocation(userLocation);

          // Calculate distances to each poi
          const newDistances: { [key: string]: number } = {};
          props.pois.forEach((poi) => {
            if (
              window.google &&
              window.google.maps &&
              window.google.maps.geometry
            ) {
              const poiLocation = new window.google.maps.LatLng(
                poi.location.lat,
                poi.location.lng
              );
              const userLatLng = new window.google.maps.LatLng(
                userLocation.lat,
                userLocation.lng
              );
              const distance =
                window.google.maps.geometry.spherical.computeDistanceBetween(
                  userLatLng,
                  poiLocation
                );
              newDistances[poi.key] = distance;
            } else {
              console.error("Google Maps API or geometry library not loaded.");
            }
          });
          setDistances(newDistances);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [props.pois]);

  return (
    <>
      {props.pois.map((poi: Poi) => (
        <AdvancedMarker key={poi.key} position={poi.location}>
          <Pin
            background={"#FF0000"}
            glyphColor={"#C70039"}
            borderColor={"#ff5b5b"}
          />
        </AdvancedMarker>
      ))}
      {currentLocation && (
        <Marker
          key="current-location"
          position={currentLocation}
          icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          // label="You are here"
        />
      )}
      {currentLocation && (
        <div>
          {Object.entries(distances).map(([key, distance]) => (
            <div>
              <p key={key}>
              Distance to {key}: {(distance / 1000).toFixed(2)} km
            </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// root
const root = createRoot(document.getElementById("app"));
root.render(<App />);

export default App;
