import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next.use(Backend).init({
    lng: 'id',
    fallbackLng: 'id',
    debug: false,
    backend: {
        loadPath: './locales/{{lng}}.json',
    },
    interpolation: {
        escapeValue: false,
    },
});

export default i18next;
