import React, { useMemo } from 'react';
import { Marker, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { PersonPopup } from '../Popups/PersonPopup';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Default icon
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Highlight icon for multiple projects
const highlightIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const Reabilita60Layer = ({ data }) => {
  // Filter only records with valid lat/lng
  const pointsWithCoords = useMemo(() => {
    return data.filter(person => person.latitude !== null && person.longitude !== null);
  }, [data]);

  return (
    <LayerGroup>
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        maxClusterRadius={50}
      >
        {pointsWithCoords.map((person) => (
          <Marker
            key={person.id}
            position={[person.latitude, person.longitude]}
            icon={person.pessoa_em_multiplos_projetos ? highlightIcon : defaultIcon}
          >
            <PersonPopup person={person} />
          </Marker>
        ))}
      </MarkerClusterGroup>
    </LayerGroup>
  );
};
