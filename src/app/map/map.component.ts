import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LocationService } from '../services/location.service';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  routePoints: L.LatLng[] = [];

  animatedCircleIcon = {
    icon: L.divIcon({
      className: 'gps_marker_icon',
      html: '<div class="gps_marker"></div>',
      iconSize: [18, 22],
    }),
  };

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    const fixedLocation = L.latLng(42.36575, -71.05747);
    this.initMap(fixedLocation);

    this.getPosition().subscribe(
      (position) => {
        if (this.map && this.marker) {
          this.marker.setLatLng([position.latitude, position.longitude]);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  boundary: any = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-71.1058313, 42.4138324, 0.0],
          [-71.0366555, 42.4141492, 0.0],
          [-71.0365697, 42.4405666, 0.0],
          [-71.1066037, 42.4405033, 0.0],
          [-71.1058313, 42.4138324, 0.0],
        ],
      ],
    },
  };

  footprint: any = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-71.058035,42.3671722, 0.0],
          [ -71.0584782,42.3668767, 0.0],
          [-71.0582261,42.364447, 0.0],
          [-71.0581369,42.3644294, 0.0],
          [-71.0566221,42.3644748, 0.0],
          [-71.0567026,42.36543, 0.0],
          [-71.0562896,42.3656916, 0.0],
          [-71.0572035,42.3662289, 0.0],
          [-71.058035,42.3671722, 0.0],
        ],
      ],
    },
  };

  mbtaIcon = L.icon({
    iconUrl: '/assets/mbta.png',
    iconSize: [24, 24],
  });

  mbtaLocation = L.latLng(42.36468, -71.0596);
  mbtaLocation2 = L.latLng(42.36559, -71.06062);

  siteIcon = L.icon({
    iconUrl: '/assets/stage.png',
    iconSize: [40, 40],
  });

  siteLocation = L.latLng(42.36597, -71.05741);

  initMap(fixedLocation: L.LatLng) {
    
    this.map = L.map('map').setView(fixedLocation, 18);
    L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
      {
        minZoom: 14,
        maxNativeZoom: 20,
        maxZoom: 20,
        crossOrigin: true,
      }
    ).addTo(this.map);
    L.geoJSON(this.footprint, {
      style: {
        color: '#c0392b',
        weight: 4,
        fillColor: '#e74c3c',
        fillOpacity: 0.3,
      },
    }).addTo(this.map);

    const siteMarker = L.marker(this.siteLocation, {
      icon: this.siteIcon,
    }).addTo(this.map);

    const mbtaMarker = L.marker(this.mbtaLocation, {
      icon: this.mbtaIcon,
    }).addTo(this.map);

    const mbtaMarker2 = L.marker(this.mbtaLocation2, {
      icon: this.mbtaIcon,
    }).addTo(this.map);

    // this.marker = L.marker(fixedLocation, {
    //   icon: this.animatedCircleIcon.icon,
    // }).addTo(this.map);
  
    this.getPosition().subscribe(
      (position) => {
        const latLng = L.latLng(position.latitude, position.longitude);
        const isInsideBoundary = booleanPointInPolygon(
          turf.point([position.longitude, position.latitude]),
          this.boundary
        );
        if (this.map && this.marker) {
          if (isInsideBoundary) {
            this.marker.setLatLng(latLng);
            this.map.setView(latLng, 16);
          } else {
            this.marker.setLatLng([0, 0]);
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getPosition(): Observable<{ latitude: number; longitude: number }> {
    return new Observable<{ latitude: number; longitude: number }>(
      (observer) => {
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              this.locationService.setPosition({ latitude, longitude });
              if (this.map && this.marker) {
                this.marker.setLatLng([latitude, longitude]);
              }
              observer.next({ latitude, longitude });
            },
            (error) => {
              observer.error(error);
            }
          );
        } else {
          observer.error('Geolocation is not supported by this browser.');
        }
      }
    );
  }
}
