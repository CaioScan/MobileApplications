import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizePlaceType, placeKey, type Coordinates, type Place } from '../models/place';
import type { Permission } from '../models/user';
import { requirePermission } from './user.repo';

const LIST_KEY = 'place@LIST_KEY';
let pendingWrite: Promise<unknown> = Promise.resolve();

async function readPlaces(): Promise<Place[]> {
    const json = await AsyncStorage.getItem(LIST_KEY);
    if (json === null) return [];

    const places = JSON.parse(json) as (Omit<Place, 'type'> & { type?: string })[];
    return places.map(place => ({ ...place, type: normalizePlaceType(place.type) }));
}

export async function getPlaces(actorId: string) {
    await requirePermission(actorId, 'viewPoints');
    return readPlaces();
}

function writePlaces(
    actorId: string,
    permission: Permission,
    update: (places: Place[]) => Place[],
) {
    const write = pendingWrite.then(async () => {
        await requirePermission(actorId, permission);
        const places = update(await readPlaces());
        await AsyncStorage.setItem(LIST_KEY, JSON.stringify(places));
        return places;
    });
    pendingWrite = write.catch(() => undefined);
    return write;
}

export function addPlace(actorId: string, place: Place) {
    return writePlaces(actorId, 'addPoint', places => {
        const { latitude, longitude } = place;
        const name = place.name.trim();
        if (!name) throw new Error('Informe o nome do ponto.');
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
            || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            throw new Error('Selecione coordenadas válidas no mapa.');
        }
        if (places.some(existing => placeKey(existing) === placeKey(place))) {
            throw new Error('Já existe um ponto nessas coordenadas.');
        }
        return [...places, { ...place, name, type: normalizePlaceType(place.type), description: place.description?.trim() }];
    });
}

export function deletePlace(actorId: string, coordinates: Coordinates) {
    return writePlaces(actorId, 'deletePoint',
        places => places.filter(place => placeKey(place) !== placeKey(coordinates)));
}
