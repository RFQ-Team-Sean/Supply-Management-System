import { environmentConfig } from "./environment.config";

export const environment: environmentConfig = {
    use: 'local',
    services: {
        'auth-service': 'https://quanby-staging.com/api',
        'procurement-service': 'https://quanby-staging.com/api',
        'supply-service': 'https://quanby-staging.com/api',
    },
    api: 'https://quanby-staging.com/api',
    secret: 'random-encrypt-32-key',
    service: 'procurement-service',
    debug: true
}