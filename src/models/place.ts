export type Coordinates = {
    latitude: number;
    longitude: number;
};

export const placeTypeLabels = {
    restaurant: 'Restaurante',
    parking: 'Estacionamento',
    attraction: 'Ponto turístico',
    other: 'Outro',
};

export type PlaceType = keyof typeof placeTypeLabels;

export const placeTypes = Object.keys(placeTypeLabels) as PlaceType[];
export const defaultPlaceType: PlaceType = 'other';

export function normalizePlaceType(value: unknown): PlaceType {
    return typeof value === 'string' && Object.hasOwn(placeTypeLabels, value)
        ? value as PlaceType
        : defaultPlaceType;
}

export type Place = Coordinates & {
    name: string;
    type: PlaceType;
    description?: string;
};

export function placeKey({ latitude, longitude }: Coordinates) {
    return `${latitude},${longitude}`;
}
