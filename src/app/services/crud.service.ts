import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, filter, firstValueFrom, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environment/environment';
import { WebSocketSubject } from 'rxjs/webSocket'; // rxjs WebSocketSubject

import * as DummyData from '../schema/dummy';
import { UserService } from './user.service';
import * as Schema from '../schema/schema';
import { DateFields, Relations } from '../schema/mapper';
interface Message {
  severity: 'success' | 'info' | 'warn' | 'error'|'danger'|'primary'|'secondary';
  summary: string;
  detail: string;
}

type SchemaType = typeof Schema;
type SchemaClassType = Extract<SchemaType[keyof SchemaType], new (...args: any) => any>;

type RecursiveSchema<T extends keyof SchemaType> = {
  [K in T]?: K extends keyof SchemaType
    ? boolean | RecursiveSchema<keyof SchemaType & keyof InstanceType<Extract<SchemaType[K], new (...args: any) => any>>> 
    : never;
};

class WebSocketService {
  private socket: WebSocketSubject<any>;
  private localTrigger = new Subject<any>(); // Subject for local mode updates

  constructor(private userService:UserService) {
    if (environment.use !== 'local') {
      const token = this.userService.getToken();
      // WebSocket mode for non-local environments
      this.socket = new WebSocketSubject(environment.api.replace('api','ws').replace('https', 'wss').replace('http', 'ws')+`?token=${encodeURIComponent(token??'')}`);
    }
    // No socket initialization for local mode; we'll use localTrigger instead
  }

  // Listen to multiple tables (or a single table if a string is provided)
  listenToTable(tables: string | string[]): Observable<any> {
    const tableArray = Array.isArray(tables) ? tables : [tables]; // Normalize to array

    if (environment.use !== 'local') {
      // WebSocket mode: Filter messages for any of the specified tables
      return this.socket.asObservable().pipe(
        filter(table => tableArray.includes(table))
      );
    } else {
      // Local mode: Filter localTrigger emissions for the specified tables
      return this.localTrigger.asObservable().pipe(
        filter(table => tableArray.includes(table))
      );
    }
  }

  close(){
    this.socket.unsubscribe();
  }
  localSend(table: string): void {
    this.localTrigger.next(table);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private baseUrl = environment.use == 'assets' || environment.use == 'local' ? '/assets/dummy' : environment.api; // API base URL or dummy data for local
  private wsService = new WebSocketService(this.userService);
  
  private messageSubject = new Subject<Message>();
  message$ = this.messageSubject.asObservable();
  private getTableName(input: string): string {
    return input.charAt(0).toLowerCase() + input.slice(1);
  }

  constructor(private http: HttpClient,private userService:UserService) { }

  toast(message: Message) {
    this.messageSubject.next(message);
  }

  async flushDummyData<T>(model: { new(): T }, data: T[] | Record<string, any>): Promise<void> {
    if (environment.use == 'local') {
      const metaDataName = Reflect.getMetadata('table', model);
      const table = this.getTableName(metaDataName);
      localStorage.setItem(table, JSON.stringify(data));
    }
  }

  // Create
  async create<T>(model: { new(): T }, data: Omit<T, 'id'>): Promise<T> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
    if (environment.use == 'local') {
      // For 'local', we modify localStorage
      const dummyData: T[] = await this.getAll<T>(model);
      await new Promise(resolve => setTimeout(resolve, 500));
      dummyData.push({ id: `${Date.now()}`, ...data } as T); // Use timestamp for new ID
      localStorage.setItem(table, JSON.stringify(dummyData));
      this.wsService.localSend(table);
      return this.convertDates(dummyData[dummyData.length - 1]);
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      const url = `${this.baseUrl}/g/${table}`;
      return firstValueFrom(this.http.post<T>(url, data, {headers}).pipe(
        map(data => this.convertDates(data)),
        catchError((error: any) => {
          let errorMessage = 'An unknown error occurred. Please try again later.';
          
          if (error.error) {
            this.console(error.error);  // Log the error
            errorMessage = error.error.error;
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
  
          // Throw the error instead of returning it
          return throwError(() => new Error(errorMessage));
        })
      ));
    }
  }

  // Read (Get all records)
  async getAll<T>(
    model: { new(): T },
    options: {
      limit?: number;
      offset?: number;
      sort?: Partial<Record<keyof T, 'asc'| 'desc'>>;
      filter?: Partial<Record<keyof T, T[keyof T]>>, // key-value pairs for filtering
      fields?: (keyof T)[]; // specific fields to return
    } = {}
  ): Promise<T[]> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
    const { limit = 100, offset = 0, sort, filter, fields } = options;

    if (environment.use === 'local') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dummyData = localStorage.getItem(table);
      let data: T[] = [];

      if (dummyData) {
        try {
          data = JSON.parse(dummyData) as T[];
        } catch (e) {
          return [];
        }
      } else {
        const metaDataName = Reflect.getMetadata('table', model);
        await this.flushDummyData(model, DummyData[metaDataName + 'Data' as keyof typeof DummyData] as T[]);
        data = (DummyData[metaDataName + 'Data' as keyof typeof DummyData] as T[] | undefined) ?? [];
      }

      // Apply local filtering and pagination
      let result = [...data];

      // Apply filter
      if (filter) {
        result = result.filter(item =>
          Object.entries(filter).every(([key, value]) =>
            (item as any)[key] === value)
        );
      }

      // Apply sort
      if (sort) {
        const field = Object.keys(sort)[0] as keyof T; // Get the first key
        const direction = sort[field]; // Get the corresponding direction
        result.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (direction?.toLowerCase() === 'desc') {
            return valA > valB ? -1 : valA < valB ? 1 : 0;
          }
          return valA < valB ? -1 : valA > valB ? 1 : 0;
        });
      }

      // Apply limit and offset
      return this.convertDates(result).slice(offset, offset + limit);
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      const url = `${this.baseUrl}/g/${table}${environment.use === 'assets' ? '.json' : ''}`;
      const params: Record<string, any> = {
        limit,
        offset,
        ...(sort && { sort: JSON.stringify(sort) }),
        ...(filter && { filter: JSON.stringify(filter) }),
        ...(fields && { fields: fields.join(',') })
      };

      return firstValueFrom(
        this.http.get<T[]>(url, { params , headers }).pipe(
          map(data => this.convertDates(data)),
          catchError((error: any) => {
            let errorMessage = 'An unknown error occurred. Please try again later.';
            
            if (error.error) {
              this.console(error.error);  // Log the error
              errorMessage = error.error.error;
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }
    
            // Throw the error instead of returning it
            return throwError(() => new Error(errorMessage));
          })
        )
      );
    }
  }

  live<T extends { new(): any }[]>(...models: T){
    
    const tableNames = models.map(model => {
      const metaDataName = Reflect.getMetadata('table', model);
      return this.getTableName(metaDataName)});
    return this.wsService.listenToTable(tableNames);
  }

  endLiveSessions(){
    this.wsService.close();
  }

  async forJoin<T extends { new(): any }[]>(
    ...models: T
  ): Promise<{ [K in keyof T]: T[K] extends { new(): infer U } ? U[] : never }> {
    
    const tableNames = models.map(model => {
      const metaDataName = Reflect.getMetadata('table', model);
      return this.getTableName(metaDataName)});
    
    if (environment.use === 'local') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const results = await Promise.all(tableNames.map(async (table) => {
            const dummyData = localStorage.getItem(table);
            if (dummyData) {
                try {
                    return JSON.parse(dummyData);
                } catch (e) {
                    return [];
                }
            } else {
                const modelIndex = tableNames.indexOf(table);
                await this.flushDummyData(
                    models[modelIndex], 
                    DummyData[models[modelIndex].name + 'Data' as keyof typeof DummyData] as any
                );
                return DummyData[models[modelIndex].name + 'Data' as keyof typeof DummyData] ?? [];
            }
        }));
        return this.convertDates(results) as { [K in keyof T]: T[K] extends { new(): infer U } ? U[] : never };
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
        const url = `${this.baseUrl}/j/fetch`;
        const params = { tables: tableNames.join(',') };
        const results = await firstValueFrom(
            this.http.get(url, { params, headers }).pipe(
              map(data => this.convertDates(data)),
              catchError((error: any) => {
                let errorMessage = 'An unknown error occurred. Please try again later.';
                
                if (error.error) {
                  this.console(error.error);  // Log the error
                  errorMessage = error.error.error;
                } else if (error.status === 500) {
                  errorMessage = 'Server error. Please try again later.';
                }
        
                // Throw the error instead of returning it
                return throwError(() => new Error(errorMessage));
              })
            )
        );
        return results as { [K in keyof T]: T[K] extends { new(): infer U } ? U[] : never };

        
    }
  }

  convertDates(data: any): any {
    // Check if data is an array
    if (Array.isArray(data)) {
      return data.map(item => this.convertDates(item));
    }
    
    // If data is an object, convert each field
    for (let key in data) {
      if (Array.isArray(data[key])) {
        data[key].map((item:any) => this.convertDates(item));
      }
      if (DateFields.includes(key) && typeof data[key] === 'string') {
        data[key] = new Date(data[key]);
      }
    }
    return data;
  }

async joined<T extends keyof SchemaType>(
    modelConfig: {
      [key in T]: RecursiveSchema<keyof SchemaType & keyof InstanceType<Extract<SchemaType[key], new (...args: any) => any>>>;
    }
): Promise<InstanceType<Extract<SchemaType[T], new (...args: any) => any>>[]> {
    // Extract model references and build relationship structure
    const models: Array<new () => any> = [];
    const processConfig = (config: Record<string, any>) => {
        Object.entries(config).forEach(([modelName, value]) => {
            const model = Schema[modelName as keyof typeof Schema];
            // Only add if it's a constructor function
            if (typeof model === 'function' && model.prototype && model !== Schema.TableName) {
                if (!models.includes(model as any)) {
                    models.push(model as any);
                }
            }
            
            if (typeof value === 'object' && value !== null) {
                processConfig(value);
            }
        });
    };
    
    processConfig(modelConfig);

    const tableNames = models.map(model => {
        return this.getTableName(Reflect.getMetadata('table', model));
    });
    const rootTableName = Reflect.getMetadata('table', models[0]);
    if (environment.use === 'local') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const results = await Promise.all(tableNames.map(async (table) => {
            const dummyData = localStorage.getItem(table);
            if (dummyData) {
                try {
                    return JSON.parse(dummyData);
                } catch (e) {
                    return [];
                }
            } else {
                const modelIndex = tableNames.indexOf(table);
                await this.flushDummyData(
                    models[modelIndex],
                    DummyData[models[modelIndex].name + 'Data' as keyof typeof DummyData] as any
                );
                return DummyData[models[modelIndex].name + 'Data' as keyof typeof DummyData] ?? [];
            }
        }));

        let mainTable:any = {};
        const formatMethod = (config: Record<string, any>, level: number = 0,parent: string[]  = []) => {
          Object.entries(config).forEach(([modelName, value]) => {
            parent  = parent.slice(0,level);
            const model = Schema[modelName as keyof typeof Schema]; // Assuming models are globally accessible
            const tableName = this.getTableName(Reflect.getMetadata('table', model));
            const tableIndex = tableNames.findIndex(t => t === tableName);
            // If it's the root level or top-most parent, use mainTable to initialize
            if (parent.length == 0) {
              mainTable[modelName] = results[tableIndex];
            } else {
              const recurseToRows = (index:number,nested:any)=>{
                let list;
                if(Array.isArray(nested)){
                  list = nested
                }else{
                  list = [nested];
                }
                for(let row of list){
                  if(index == parent.length-1){
                   const relation = Relations.find(
                     (r) => (r[0] === parent[index] && r[1] === modelName) || (r[1] === parent[index] && r[0] === modelName)
                   );
                   
                   if (relation) {
                     if((relation[1] === parent[index] && relation[0] === modelName) && relation[3] == 'one-to-many'){
                     // Left Relation
                      row[modelName] = results[tableIndex].filter((r: any) => r[relation[2]] == row['id']);
                    }else{
                      // Right Relation
                      row[modelName] = results[tableIndex].find((r: any) => r['id'] == row[relation[2]]);
                     }
                   }
                  }else{
                   recurseToRows(index+1, row[parent[index+1]]);
                  }
               }
              }
              
              recurseToRows(0, mainTable[parent[0]]);
       
            }
            // If the value is an object, this means we need to go deeper into the structure
            if (typeof value === 'object' && value !== null) {
              parent[level] = modelName;
              formatMethod(value,level+1,parent); // Recurse with the new parent (modelName)
            }
          });
        };
        formatMethod(modelConfig)
        return this.convertDates(mainTable[rootTableName]);
    } else {
        let headers = new HttpHeaders();
        const token = this.userService.getToken();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        const url = `${this.baseUrl}/j/prisma`;
        // Convert the modelConfig to a format suitable for Prisma include
        const include = this.buildPrismaInclude({
          [tableNames[0]] : modelConfig[Object.keys(modelConfig)[0] as T]
        });
        const params = {
            tables: tableNames.join(','),
            include: JSON.stringify(include)
        };

        const results = await firstValueFrom(
            this.http.get(url, { params, headers }).pipe(
              map(data => this.convertDates(data)),
                catchError((error: any) => {
                    let errorMessage = 'An unknown error occurred. Please try again later.';
                    
                    if (error.error) {
                        this.console(error.error);
                        errorMessage = error.error.error;
                    } else if (error.status === 500) {
                        errorMessage = 'Server error. Please try again later.';
                    }
                    
                    return throwError(() => new Error(errorMessage));
                })
            )
        );
        
        return results as InstanceType<Extract<SchemaType[T], new (...args: any) => any>>[] | any[];
    }
}

  
  private buildPrismaInclude(config: Record<string, any>): Record<string, any> {
    const include: Record<string, any> = {};
    
    Object.entries(config).forEach(([modelName, value]) => {
        if (typeof value === 'boolean' && value) {
            include[modelName] = true;
        } else if (typeof value === 'object' && value !== null) {
            include[modelName] = {
                include: this.buildPrismaInclude(value)
            };
        }
    });
    
    return include;
}
  async get<T>(
    model: { new(): T },
    id: T[keyof T]
  ): Promise<T | undefined> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
    
    if (environment.use === 'local') {
      const dummyData: T[] = await this.getAll<T>(model);
      let filteredData = dummyData.find(d=> d['id' as keyof T] == id );
      return filteredData; // Return first matching item or undefined if no matches
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      const url = `${this.baseUrl}/g/${table}/${id}`;
      return firstValueFrom(
        this.http.get<T>(url,{ headers}).pipe(
          map(data => this.convertDates(data)),
          catchError((error: any) => {
            let errorMessage = 'An unknown error occurred. Please try again later.';
            
            if (error.error) {
              this.console(error.error);  // Log the error
              errorMessage = error.error.error;
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }
    
            // Throw the error instead of returning it
            return throwError(() => new Error(errorMessage));
          })
        )
      );
    }
  }

  // Update
  async update<T>(model: { new(): T }, id: string, data: Omit<T, 'id'>): Promise<T> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
    if (environment.use == 'local') {
      const dummyData: T[] = await this.getAll<T>(model);
      await new Promise(resolve => setTimeout(resolve, 500));
      const replaceIndex = dummyData.findIndex(i => (i as any).id == id); // Accessing `id` in a type-safe way
      if (replaceIndex !== -1) {
        dummyData[replaceIndex] = { ...dummyData[replaceIndex], ...data };
        localStorage.setItem(table, JSON.stringify(dummyData));
        this.wsService.localSend(table);
        return this.convertDates(dummyData[replaceIndex]);
      } else {
        throw new Error('Item not found');
      }
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      const url = `${this.baseUrl}/g/${table}/${id}`;
      return firstValueFrom(this.http.put<T>(url, data,{ headers} ).pipe(
        map(data => this.convertDates(data)),
        catchError((error: any) => {
          let errorMessage = 'An unknown error occurred. Please try again later.';
          
          if (error.error) {
            this.console(error.error);  // Log the error
            errorMessage = error.error.error;
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
  
          // Throw the error instead of returning it
          return throwError(() => new Error(errorMessage));
        })
      ));
    }
  }

  // Partial Update
  async partial_update<T>(model: { new(): T }, id: string, data: Partial<Omit<T, 'id'>>): Promise<T> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
    if (environment.use == 'local') {
      const dummyData: T[] = await this.getAll<T>(model);
      await new Promise(resolve => setTimeout(resolve, 500));
      const replaceIndex = dummyData.findIndex(i => (i as any).id == id); // Accessing `id` in a type-safe way
      if (replaceIndex !== -1) {
        dummyData[replaceIndex] = { ...dummyData[replaceIndex], ...data };
        localStorage.setItem(table, JSON.stringify(dummyData));
        this.wsService.localSend(table);
        return this.convertDates(dummyData[replaceIndex]);
      } else {
        throw new Error('Item not found');
      }
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      const url = `${this.baseUrl}/g/${table}/${id}`;
      return firstValueFrom(this.http.patch<T>(url, data, {headers})
      .pipe(
        map(data => this.convertDates(data)),
        catchError((error: any) => {
          let errorMessage = 'An unknown error occurred. Please try again later.';
          
          if (error.error) {
            this.console(error.error);  // Log the error
            errorMessage = error.error.error;
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
  
          // Throw the error instead of returning it
          return throwError(() => new Error(errorMessage));
        })
      ));
    }
  }

  async partial_update_multiple<T>(
    model: { new(): T },
    data: Partial<Omit<T, 'id'>>, // Partial update excluding id
    filter: Partial<Record<keyof T, T[keyof T]>>, // Filter object with keys from T
  ): Promise<T[]> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
  
    if (environment.use === 'local') {
      // Fetch all existing records
      const dummyData: T[] = await this.getAll<T>(model);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  
      // Filter and update matching items based on the filter object
      const updatedData = dummyData.map(item => {
        const matchesFilter = Object.entries(filter).every(([key, value]) => {
          return (item as any)[key] === value; // Check each filter condition
        });
        if (matchesFilter) {
          return { ...item, ...data }; // Apply partial update to matching items
        }
        return item; // Leave non-matching items unchanged
      });
  
      // Save updated data back to localStorage
      localStorage.setItem(table, JSON.stringify(updatedData));
  
      // Trigger WebSocket/local update
      this.wsService.localSend(table)
  
      // Return only the updated items
      return this.convertDates(updatedData.filter(item =>
        Object.entries(filter).every(([key, value]) => (item as any)[key] === value)
      ));
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      // Non-local: Send PATCH request with filter condition to update matching records
      const url = `${this.baseUrl}/g/${table}`;
      const params = { filter: JSON.stringify(filter) }; // Send filter as query param
      const response = await firstValueFrom(
        this.http.patch<T[]>(url, data, { params, headers }).pipe(
          map(data => this.convertDates(data)),
          catchError((error: any) => {
            let errorMessage = 'An unknown error occurred. Please try again later.';
            
            if (error.error) {
              this.console(error.error);  // Log the error
              errorMessage = error.error.error;
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }
    
            // Throw the error instead of returning it
            return throwError(() => new Error(errorMessage));
          })
        ) // Pass data as body, filter as param
      );
  
      // Trigger WebSocket update
      this.wsService.localSend(table)
  
      return response; // Return the updated array from the server
    }
  }
  // Delete
  async delete<T>(model: { new(): T }, id: string): Promise<T | undefined> {
    const metaDataName = Reflect.getMetadata('table', model);
    const table = this.getTableName(metaDataName);
    if (environment.use == 'local') {
      const dummyData: T[] = await this.getAll<T>(model);
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = dummyData.findIndex(i => (i as any).id == id); // Accessing `id` in a type-safe way
      if (index !== -1) {
        const deletedItem = dummyData.splice(index, 1)[0];
        localStorage.setItem(table, JSON.stringify(dummyData));
        this.wsService.localSend(table);
        return this.convertDates(deletedItem);
      } else {
        throw new Error('Item not found');
      }
    } else {
      let headers = new HttpHeaders();
      const token = this.userService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      const url = `${this.baseUrl}/g/${table}/${id}`;
      return firstValueFrom(this.http.delete<T>(url, {headers}).pipe(
        map(data => this.convertDates(data)),
        catchError((error: any) => {
          let errorMessage = 'An unknown error occurred. Please try again later.';
          
          if (error.error) {
            this.console(error.error);  // Log the error
            errorMessage = error.error.error;
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
  
          // Throw the error instead of returning it
          return throwError(() => new Error(errorMessage));
        })
      ));
    }
  }

  console(...log:any){
    if(environment.debug){
      console.error('Debug',log);
    }else{
      // Can put to server instead
    }
  }

}
