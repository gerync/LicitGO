// Objektum kulcsszám ellenőrzése: -1 ha kevesebb, 1 ha több, 0 ha megfelelő
export default (object, min, max) => {
    const length = Object.keys(object).length;

    if (!max) {
        if (length != min) {
            return -1;
        }
        return 0;
    }

    if (length < min) {
        return -1;
    }
    if (length > max) {
        return 1;
    }
    return 0;
}