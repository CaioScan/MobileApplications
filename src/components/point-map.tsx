import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { placeKey, placeTypeLabels } from '../models/place';
import { initialCenter, type PointMapProps } from './point-map.types';
import { pointPinImages, pointPinSize } from './point-pins';

const viewport = { latitudeDelta: 0.035, longitudeDelta: 0.035 };

export default function PointMap({ places, center, onPick, onSelect }: PointMapProps) {
    const map = useRef<MapView>(null);

    useEffect(() => {
        if (center) map.current?.animateToRegion({ ...center, ...viewport });
    }, [center]);

    return (
        <MapView
            ref={map}
            style={StyleSheet.absoluteFill}
            initialRegion={{ ...initialCenter, ...viewport }}
            onPress={event => onPick?.(event.nativeEvent.coordinate)}
        >
            {places.map(place => (
                <Marker
                    key={placeKey(place)}
                    coordinate={place}
                    accessibilityLabel={`${place.name}, ${placeTypeLabels[place.type]}`}
                    image={pointPinImages[place.type]}
                    anchor={{ x: 0.5, y: 1 }}
                    centerOffset={{ x: 0, y: -pointPinSize.height / 2 }}
                    stopPropagation
                    onPress={() => onSelect(place)}
                />
            ))}
        </MapView>
    );
}
