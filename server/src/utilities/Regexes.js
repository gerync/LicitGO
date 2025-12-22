// Reguláris kifejezések felhasználói mezők validálásához
export default {
    usertag: /^[a-z0-9_]{3,32}$/, // kisbetűs, szám, aláhúzás, 3-32 karakter
    mobile: /^\+?[1-9]\d{3,14}$/, // E.164 formátum (+ és országkód opcionális), max 14 számjegy
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // egyszerű email formátum ellenőrzés
    password: {
        lengthmin: /^.{8,}$/, // legalább 8 karakter
        lengthmax: /^.{0,32}$/, // legfeljebb 32 karakter
        lowercase: /^(?=.*[a-z]).{8,32}$/, // legalább egy kisbetű
        uppercase: /^(?=.*[A-Z]).{8,32}$/, // legalább egy nagybetű
        digit: /^(?=.*\d).{8,32}$/, // legalább egy szám
        special: /^(?=.*[!@#$%^&*]).{8,32}$/, // legalább egy speciális karakter
    },
    fullname: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄČĆĘÈÉÊËĖĮÌÍÎÏŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ ,.'-]{2,72}$/, // nevek különféle ékezetes karakterekkel, 2-72 karakter
    date: /^(\d{4}|\d{1,2})([\-\/\.])(\d{1,2})\2(\d{4}|\d{1,2})$/ // dátum formátum: YYYY-MM-DD vagy DD-MM-YYYY, elválasztó lehet -, / vagy .
};