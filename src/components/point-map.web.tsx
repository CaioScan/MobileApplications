import { Asset } from 'expo-asset';
import { useEffect, useRef, useState } from 'react';
import type { Icon, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import { StyleSheet, Text, View } from 'react-native';

import 'leaflet/dist/leaflet.css';

import { placeTypeLabels, type PlaceType } from '../models/place';
import { accessStyles } from './access-ui';
import { initialCenter, type PointMapProps } from './point-map.types';
import { pointPinImages, pointPinSize } from './point-pins';

type MapState = { map: LeafletMap; leaflet: typeof import('leaflet') };
const zoom = 13;

export default function PointMap({ places, center, onPick, onSelect }: PointMapProps) {
    const element = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<MapState | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let instance: LeafletMap | undefined;
        let cancelled = false;

        async function load() {
            try {
                const leaflet = await import('leaflet');
                if (cancelled || !element.current) return;
                instance = leaflet.map(element.current, { scrollWheelZoom: false });
                instance.setView([initialCenter.latitude, initialCenter.longitude], zoom);
                leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(instance);
                setState({ leaflet, map: instance });
            } catch {
                if (!cancelled) setFailed(true);
            }
        }

        void load();
        return () => {
            cancelled = true;
            instance?.remove();
        };
    }, []);

    useEffect(() => {
        if (!state || !onPick) return;

        function pick({ latlng }: LeafletMouseEvent) {
            onPick?.({ latitude: latlng.lat, longitude: latlng.wrap().lng });
        }

        state.map.on('click', pick);
        return () => { state.map.off('click', pick); };
    }, [state, onPick]);

    useEffect(() => {
        if (!state) return;
        const { map, leaflet } = state;
        const layer = leaflet.layerGroup().addTo(map);

        const icons = new Map<PlaceType, Icon>();
        for (const place of places) {
            let icon = icons.get(place.type);
            if (!icon) {
                const { width, height } = pointPinSize;
                icon = leaflet.icon({
                    iconUrl: Asset.fromModule(pointPinImages[place.type]).uri,
                    iconSize: [width, height],
                    iconAnchor: [width / 2, height],
                });
                icons.set(place.type, icon);
            }
            const label = `${place.name}, ${placeTypeLabels[place.type]}`;
            leaflet.marker([place.latitude, place.longitude], {
                icon, alt: label, title: label, bubblingMouseEvents: false,
            }).on('click', () => onSelect(place)).addTo(layer);
        }
        return () => { layer.remove(); };
    }, [state, places, onSelect]);

    useEffect(() => {
        if (center) state?.map.setView([center.latitude, center.longitude], zoom);
    }, [center, state]);

    return (
        <View style={StyleSheet.absoluteFill}>
            <div aria-label="Mapa de pontos" ref={element} style={{ width: '100%', height: '100%' }} />
            {failed && <Text style={accessStyles.body}>Não foi possível carregar o mapa.</Text>}
        </View>
    );
}
