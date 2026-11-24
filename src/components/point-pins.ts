import type { PlaceType } from '../models/place';

export const pointPinImages: Record<PlaceType, number> = {
    restaurant: require('../../assets/pins/restaurant.png'),
    parking: require('../../assets/pins/parking.png'),
    attraction: require('../../assets/pins/attraction.png'),
    other: require('../../assets/pins/other.png'),
};

export const pointPinSize = { width: 32, height: 38 };
