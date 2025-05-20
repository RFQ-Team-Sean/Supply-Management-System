import { environmentConfig } from "./environment.config";

export const environment: environmentConfig = {
    use: 'local', // assets, local or server
    services: {
        'auth-service': 'https://quanby-staging.com/api',
        'procurement-service': 'https://quanby-staging.com/api',
        'supply-service': 'https://quanby-staging.com/api',
    },
    api: 'https://quanby-staging.com/api', // Added missing api property
    secret: 'random-encrypt-32-key',
    service: 'procurement-service',
    debug: true
}