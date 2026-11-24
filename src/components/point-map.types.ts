import type { Coordinates, Place } from '../models/place';

export const initialCenter = { latitude: -23.55052, longitude: -46.63331 };

export type PointMapProps = {
    places: Place[];
    center?: Coordinates;
    onPick?: (coordinates: Coordinates) => void;
    onSelect: (place: Place) => void;
};
