// Import microservices
// import * as Schema1 from '../app/schema/microservices/procurement-service/schema';
// import * as Schema2 from '../app/schema/microservices/procurement-service/schema';
// import { Relations as Relation2, DateFields as DateFields1 } from 'src/app/schema/microservices/procurement-service/mapper';
// import { Relations as Relation1, DateFields as DateFields2 } from 'src/app/schema/microservices/procurement-service/mapper';

// Export as one
// export const Schema = {...Schema1, ...Schema2};
// export const Relations = [...Relation1, ...Relation2];
// export const DateFields = [...DateFields1, ...DateFields2];


// Import Default Schema
import * as SchemaDefault from '../app/schema/schema';
import {Relations as RelationDefault, DateFields as DateFieldsDefault} from 'src/app/schema/mapper';

// Export Default Schema
export const Schema = SchemaDefault;
export const Relations = RelationDefault;
export const DateFields = DateFieldsDefault;

export interface environmentConfig {
    use: 'assets' | 'local' | 'server',
    services: {
        'auth-service': string;
        'supply-service': string;
        'procurement-service': string;
    },
    api: string, // Add this line
    secret: string,
    service: keyof environmentConfig['services'],
    debug: boolean,
}

