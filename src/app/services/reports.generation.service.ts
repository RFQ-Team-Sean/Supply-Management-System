import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CrudService } from './crud.service';
import { RPCPPE, RPCPPEItem, IIRUP, IIRUPItem, PTR, PTRItem, PAR, PARItem, RLSDDP, RLSDDPItem } from '../schema/schema';
import { RPCPPEData, IIRUPData, PTRData, PARData, RLSDDPData, ICSData, IARData, RPCIData } from '../schema/reportsgeneration-dummy';

export interface ICS {
  ics_no: string;
  entity_name: string;
  fund_cluster: string;
  date: Date;
  inventory_item_no: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  description: string;
  estimated_useful_life: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAR {
  id: string;
  iar_no: string;
  po_no: string;
  supplier: string;
  date: Date;
  invoice_no: string;
  total_amount: number;
  status: string;
  remarks?: string;
  created_at?: Date;
}

export interface RPCI {
  id: string;
  rpci_no: string;
  fund_cluster: string;
  date: Date;
  department: string;
  accountable_officer: string;
  total_value: number;
  status: string;
  remarks?: string;
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IcsService {
  private apiUrl = `${environment.api}/ics`;

  constructor(private http: HttpClient) {
    // Initialize local storage with dummy data if using local environment
    if (environment.use === 'local' && !localStorage.getItem('ics')) {
      localStorage.setItem('ics', JSON.stringify(ICSData));
    }
  }

  getAllIcs(): Observable<ICS[]> {
    if (environment.use === 'local') {
      const icsData = JSON.parse(localStorage.getItem('ics') || '[]');
      return of(icsData);
    }

    console.log('Fetching from URL:', this.apiUrl);
    return this.http.get<ICS[]>(this.apiUrl).pipe(
      tap(data => console.log('Response data:', data)),
      catchError(error => {
        console.error('Error fetching ICS:', error);
        return throwError(() => error);
      })
    );
  }

  createIcs(ics: ICS): Observable<any> {
    if (environment.use === 'local') {
      const icsData = JSON.parse(localStorage.getItem('ics') || '[]');
      const newIcs = {
        ...ics,
        created_at: new Date(),
        updated_at: new Date()
      };
      icsData.push(newIcs);
      localStorage.setItem('ics', JSON.stringify(icsData));
      return of(newIcs);
    }

    return this.http.post(this.apiUrl, ics);
  }

  updateIcs(id: string, ics: ICS): Observable<any> {
    if (environment.use === 'local') {
      const icsData = JSON.parse(localStorage.getItem('ics') || '[]');
      const index = icsData.findIndex((item: ICS) => item.ics_no === id);
      if (index !== -1) {
        const updatedIcs = {
          ...ics,
          updated_at: new Date()
        };
        icsData[index] = updatedIcs;
        localStorage.setItem('ics', JSON.stringify(icsData));
        return of(updatedIcs);
      }
      return throwError(() => new Error('ICS not found'));
    }

    return this.http.put(`${this.apiUrl}/${id}`, ics);
  }

  deleteIcs(id: string): Observable<any> {
    if (environment.use === 'local') {
      const icsData = JSON.parse(localStorage.getItem('ics') || '[]');
      const index = icsData.findIndex((item: ICS) => item.ics_no === id);
      if (index !== -1) {
        icsData.splice(index, 1);
        localStorage.setItem('ics', JSON.stringify(icsData));
        return of({ success: true });
      }
      return throwError(() => new Error('ICS not found'));
    }

    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReportsGenerationService {
  private iarApiUrl = `${environment.api}/iar`;
  private rpciApiUrl = `${environment.api}/rpci`;
  private rpcppeApiUrl = `${environment.api}/rpcppe`;
  private rpcppeItemsApiUrl = `${environment.api}/rpcppe_items`;

  constructor(private http: HttpClient, private crudService: CrudService) {
    // Initialize local storage with dummy data if using local environment
    if (environment.use === 'local') {
      // RPCPPE initialization
      if (!localStorage.getItem('rpcppe')) {
        localStorage.setItem('rpcppe', JSON.stringify(RPCPPEData));
      }
      if (!localStorage.getItem('rpcppe_items')) {
        const rpcppeItems = RPCPPEData.flatMap(rpcppe => rpcppe.items);
        localStorage.setItem('rpcppe_items', JSON.stringify(rpcppeItems));
      }

      // IAR initialization
      if (!localStorage.getItem('iar')) {
        localStorage.setItem('iar', JSON.stringify(IARData));
      }

      // IIRUP initialization
      if (!localStorage.getItem('iirup')) {
        localStorage.setItem('iirup', JSON.stringify(IIRUPData));
      }
      if (!localStorage.getItem('iirup_items')) {
        const iirupItems = IIRUPData.flatMap(iirup => iirup.items);
        localStorage.setItem('iirup_items', JSON.stringify(iirupItems));
      }

      // PTR initialization
      if (!localStorage.getItem('ptr')) {
        localStorage.setItem('ptr', JSON.stringify(PTRData));
      }
      if (!localStorage.getItem('ptr_items')) {
        const ptrItems = PTRData.flatMap(ptr => ptr.items);
        localStorage.setItem('ptr_items', JSON.stringify(ptrItems));
      }

      // PAR initialization
      if (!localStorage.getItem('par')) {
        localStorage.setItem('par', JSON.stringify(PARData));
      }
      if (!localStorage.getItem('par_items')) {
        const parItems = PARData.flatMap(par => par.items);
        localStorage.setItem('par_items', JSON.stringify(parItems));
      }

      // RLSDDP initialization
      if (!localStorage.getItem('rlsddp')) {
        localStorage.setItem('rlsddp', JSON.stringify(RLSDDPData));
      }
      if (!localStorage.getItem('rlsddp_items')) {
        const rlsddpItems = RLSDDPData.flatMap(rlsddp => rlsddp.items);
        localStorage.setItem('rlsddp_items', JSON.stringify(rlsddpItems));
      }

      // RPCI initialization
      if (!localStorage.getItem('rpci')) {
        localStorage.setItem('rpci', JSON.stringify(RPCIData));
      }
    }
  }

  getAllIar(): Observable<IAR[]> {
    if (environment.use === 'local') {
      const iarData = JSON.parse(localStorage.getItem('iar') || '[]');
      return of(iarData);
    }

    console.log('Fetching IAR from URL:', this.iarApiUrl);
    return this.http.get<IAR[]>(this.iarApiUrl).pipe(
      tap(data => console.log('Response data:', data)),
      catchError(error => {
        console.error('Error fetching IAR:', error);
        return throwError(() => error);
      })
    );
  }

  createIar(iar: IAR): Observable<any> {
    if (environment.use === 'local') {
      const iarData = JSON.parse(localStorage.getItem('iar') || '[]');
      const newIar = {
        ...iar,
        id: iar.iar_no,
        created_at: new Date()
      };
      iarData.push(newIar);
      localStorage.setItem('iar', JSON.stringify(iarData));
      return of(newIar);
    }

    return this.http.post(this.iarApiUrl, iar);
  }

  updateIar(id: string, iar: IAR): Observable<any> {
    if (environment.use === 'local') {
      const iarData = JSON.parse(localStorage.getItem('iar') || '[]');
      const index = iarData.findIndex((item: IAR) => item.id === id);
      if (index !== -1) {
        iarData[index] = { ...iar, id };
        localStorage.setItem('iar', JSON.stringify(iarData));
        return of(iarData[index]);
      }
      return throwError(() => new Error('IAR not found'));
    }

    return this.http.put(`${this.iarApiUrl}/${id}`, iar);
  }

  deleteIar(id: string): Observable<any> {
    if (environment.use === 'local') {
      const iarData = JSON.parse(localStorage.getItem('iar') || '[]');
      const index = iarData.findIndex((item: IAR) => item.id === id);
      if (index !== -1) {
        iarData.splice(index, 1);
        localStorage.setItem('iar', JSON.stringify(iarData));
        return of({ success: true });
      }
      return throwError(() => new Error('IAR not found'));
    }

    return this.http.delete(`${this.iarApiUrl}/${id}`);
  }

  getAllRpci(): Observable<RPCI[]> {
    if (environment.use === 'local') {
      const rpciData = JSON.parse(localStorage.getItem('rpci') || '[]');
      return of(rpciData);
    }

    console.log('Fetching RPCI from URL:', this.rpciApiUrl);
    return this.http.get<RPCI[]>(this.rpciApiUrl).pipe(
      tap(data => console.log('Response data:', data)),
      catchError(error => {
        console.error('Error fetching RPCI:', error);
        return throwError(() => error);
      })
    );
  }

  createRpci(rpci: RPCI): Observable<any> {
    if (environment.use === 'local') {
      const rpciData = JSON.parse(localStorage.getItem('rpci') || '[]');
      const newRpci = {
        ...rpci,
        id: rpci.rpci_no, // Using rpci_no as id for consistency
        created_at: new Date()
      };
      rpciData.push(newRpci);
      localStorage.setItem('rpci', JSON.stringify(rpciData));
      return of(newRpci);
    }

    return this.http.post(this.rpciApiUrl, rpci);
  }

  updateRpci(id: string, rpci: RPCI): Observable<any> {
    if (environment.use === 'local') {
      const rpciData = JSON.parse(localStorage.getItem('rpci') || '[]');
      const index = rpciData.findIndex((item: RPCI) => item.id === id);
      if (index !== -1) {
        rpciData[index] = { ...rpci, id };
        localStorage.setItem('rpci', JSON.stringify(rpciData));
        return of(rpciData[index]);
      }
      return throwError(() => new Error('RPCI not found'));
    }

    return this.http.put(`${this.rpciApiUrl}/${id}`, rpci);
  }

  deleteRpci(id: string): Observable<any> {
    if (environment.use === 'local') {
      const rpciData = JSON.parse(localStorage.getItem('rpci') || '[]');
      const index = rpciData.findIndex((item: RPCI) => item.id === id);
      if (index !== -1) {
        rpciData.splice(index, 1);
        localStorage.setItem('rpci', JSON.stringify(rpciData));
        return of({ success: true });
      }
      return throwError(() => new Error('RPCI not found'));
    }

    return this.http.delete(`${this.rpciApiUrl}/${id}`);
  }

  // RPCPPE Methods
  getAllRPCPPE(): Observable<RPCPPE[]> {
    if (environment.use === 'local') {
      const rpcppeList = JSON.parse(localStorage.getItem('rpcppe') || '[]');
      const items = JSON.parse(localStorage.getItem('rpcppe_items') || '[]');
      
      return of(rpcppeList.map((rpcppe: RPCPPE) => ({
        ...rpcppe,
        items: items.filter((item: RPCPPEItem) => item.rpcppeId === rpcppe.id)
      })));
    }

    console.log('Fetching from URL:', this.rpcppeApiUrl);
    // First fetch all RPCPPEs
    return this.http.get<any[]>(this.rpcppeApiUrl).pipe(
      switchMap(rpcppes => {
        if (!rpcppes || rpcppes.length === 0) {
          console.log('No RPCPPEs found');
          return of([]);
        }
        
        console.log('RPCPPE count:', rpcppes.length);
        console.log('Raw RPCPPE data:', rpcppes);
        
        // Now get all items in one request
        return this.http.get<any[]>(this.rpcppeItemsApiUrl).pipe(
          map(allItems => {
            console.log('All RPCPPE items:', allItems);
            
            // Map each RPCPPE to include its items
            return rpcppes.map(rpcppe => {
              // Find items for this RPCPPE
              const items = allItems.filter(item => 
                item.rpcppe_id === rpcppe.id || item.rpcppeId === rpcppe.id
              );
              
              console.log(`Items for RPCPPE ${rpcppe.id}:`, items);
              
              // Ensure all required fields exist
              return {
                id: rpcppe.id,
                rpcppeNo: rpcppe.rpcppeNo || rpcppe.rpcppe_no || '',
                entityName: rpcppe.entityName || rpcppe.entity_name || '',
                fundCluster: rpcppe.fundCluster || rpcppe.fund_cluster || '',
                accountableOfficer: rpcppe.accountableOfficer || rpcppe.accountable_officer || '',
                designation: rpcppe.designation || '',
                accountabilityDate: rpcppe.accountabilityDate || rpcppe.accountability_date,
                date: rpcppe.date,
                totalValue: rpcppe.totalValue || rpcppe.total_value || 0,
                remarks: rpcppe.remarks || '',
                status: rpcppe.status || 'draft',
                items: (items || []).map(item => ({
                  id: item.id,
                  rpcppeId: item.rpcppeId || item.rpcppe_id,
                  article: item.article || '',
                  description: item.description || '',
                  propertyNo: item.propertyNo || item.property_no || '',
                  quantity: item.quantity || 0,
                  unitValue: item.unitValue || item.unit_value || 0,
                  totalValue: item.totalValue || item.total_value || 0,
                  shortageQty: item.shortageQty || item.shortage_qty || 0,
                  shortageValue: item.shortageValue || item.shortage_value || 0,
                  remarks: item.remarks || ''
                }))
              };
            });
          }),
          catchError(error => {
            console.error('Error fetching RPCPPE items:', error);
            // Return RPCPPEs without items if there's an error
            return of(rpcppes.map(rpcppe => ({
              ...rpcppe,
              items: []
            })));
          })
        );
      }),
      tap(data => console.log('Combined RPCPPE data:', data)),
      catchError(error => {
        console.error('Error fetching RPCPPE:', error);
        return throwError(() => error);
      })
    );
  }

  getRPCPPE(id: string): Observable<RPCPPE> {
    if (environment.use === 'local') {
      const rpcppeList = JSON.parse(localStorage.getItem('rpcppe') || '[]');
      const items = JSON.parse(localStorage.getItem('rpcppe_items') || '[]');
      const rpcppe = rpcppeList.find((r: RPCPPE) => r.id === id);
      if (rpcppe) {
        console.log('Local environment - Found RPCPPE:', rpcppe);
        return of({
          ...rpcppe,
          items: items.filter((item: RPCPPEItem) => item.rpcppeId === id)
        });
      }
      return throwError(() => new Error('RPCPPE not found'));
    }
    
    // Fetch the RPCPPE first
    return this.http.get<any>(`${this.rpcppeApiUrl}/${id}`).pipe(
      switchMap(response => {
        if (!response) {
          return throwError(() => new Error('RPCPPE not found'));
        }
        
        // The API returns an array with one object, extract the first element if it's an array
        const rpcppe = Array.isArray(response) ? response[0] : response;
        
        console.log('Fetched single RPCPPE:', JSON.stringify(rpcppe, null, 2));
        
        // Get all items and filter for the current RPCPPE
        return this.http.get<any[]>(this.rpcppeItemsApiUrl).pipe(
          map(allItems => {
            // Filter items for this RPCPPE
            const items = allItems.filter(item => 
              item.rpcppe_id === id || item.rpcppeId === id
            );
            
            console.log(`Filtered items for RPCPPE ${id}:`, items);
            
            // Create a normalized object that guarantees all properties are present
            // This helps ensure the form gets populated correctly
            const normalizedRpcppe: RPCPPE = {
              id: rpcppe.id,
              rpcppeNo: rpcppe.rpcppeNo || rpcppe.rpcppe_no || '',
              entityName: rpcppe.entityName || rpcppe.entity_name || '',
              fundCluster: rpcppe.fundCluster || rpcppe.fund_cluster || '',
              accountableOfficer: rpcppe.accountableOfficer || rpcppe.accountable_officer || '',
              designation: rpcppe.designation || '',
              accountabilityDate: rpcppe.accountabilityDate || rpcppe.accountability_date || new Date(),
              date: rpcppe.date || new Date(),
              totalValue: Number(rpcppe.totalValue || rpcppe.total_value || 0),
              remarks: rpcppe.remarks || '',
              status: rpcppe.status || 'draft',
              items: (items || []).map(item => ({
                id: item.id,
                rpcppeId: item.rpcppeId || item.rpcppe_id,
                article: item.article || '',
                description: item.description || '',
                propertyNo: item.propertyNo || item.property_no || '',
                quantity: Number(item.quantity || 0),
                unitValue: Number(item.unitValue || item.unit_value || 0),
                totalValue: Number(item.totalValue || item.total_value || 0),
                shortageQty: Number(item.shortageQty || item.shortage_qty || 0),
                shortageValue: Number(item.shortageValue || item.shortage_value || 0),
                remarks: item.remarks || ''
              }))
            };
            
            console.log('Normalized RPCPPE:', normalizedRpcppe);
            return normalizedRpcppe;
          }),
          catchError(error => {
            console.error('Error fetching RPCPPE items:', error);
            // Return the RPCPPE without items if there's an error
            return of({
              id: rpcppe.id,
              rpcppeNo: rpcppe.rpcppeNo || rpcppe.rpcppe_no || '',
              entityName: rpcppe.entityName || rpcppe.entity_name || '',
              fundCluster: rpcppe.fundCluster || rpcppe.fund_cluster || '',
              accountableOfficer: rpcppe.accountableOfficer || rpcppe.accountable_officer || '',
              designation: rpcppe.designation || '',
              accountabilityDate: rpcppe.accountabilityDate || rpcppe.accountability_date || new Date(),
              date: rpcppe.date || new Date(),
              totalValue: Number(rpcppe.totalValue || rpcppe.total_value || 0),
              remarks: rpcppe.remarks || '',
              status: rpcppe.status || 'draft',
              items: []
            });
          })
        );
      })
    );
  }

  createRPCPPE(rpcppe: Omit<RPCPPE, 'id'>): Observable<RPCPPE> {
    if (environment.use === 'local') {
      const rpcppeList = JSON.parse(localStorage.getItem('rpcppe') || '[]');
      const newRPCPPE = {
        ...rpcppe,
        id: 'RPCPPE-' + Date.now(),
        items: []
      };
      rpcppeList.push(newRPCPPE);
      localStorage.setItem('rpcppe', JSON.stringify(rpcppeList));
      return of(newRPCPPE);
    }
    
    // Save the main RPCPPE first without items
    const { items, ...rpcppeData } = rpcppe;
    
    // Convert camelCase to snake_case for backend API
    const formattedRpcppeData = {
      rpcppe_no: rpcppeData.rpcppeNo,
      entity_name: rpcppeData.entityName,
      fund_cluster: rpcppeData.fundCluster,
      accountable_officer: rpcppeData.accountableOfficer,
      designation: rpcppeData.designation,
      accountability_date: rpcppeData.accountabilityDate,
      date: rpcppeData.date,
      total_value: rpcppeData.totalValue,
      remarks: rpcppeData.remarks,
      status: rpcppeData.status
    };
    
    // Log the data being sent
    console.log('Creating RPCPPE with data:', formattedRpcppeData);
    
    return this.http.post<RPCPPE>(this.rpcppeApiUrl, formattedRpcppeData).pipe(
      tap(response => console.log('RPCPPE created successfully:', response)),
      switchMap(savedRPCPPE => {
        if (!items || items.length === 0) {
          return of(savedRPCPPE);
        }
        
        // Create each item individually
        const createRequests = items.map(item => {
          const newItem = {
            article: item.article,
            description: item.description,
            property_no: item.propertyNo,
            quantity: item.quantity,
            unit_value: item.unitValue,
            total_value: item.totalValue,
            shortage_qty: item.shortageQty,
            shortage_value: item.shortageValue,
            remarks: item.remarks,
            rpcppe_id: savedRPCPPE.id // Use the ID returned from the server
          };
          console.log('Creating item:', newItem);
          return this.http.post<RPCPPEItem>(this.rpcppeItemsApiUrl, newItem).pipe(
            tap(response => console.log('Item created successfully:', response)),
            catchError(error => {
              console.error('Error creating RPCPPE item:', error);
              // Return null instead of throwing to allow other items to be created
              return of(null);
            })
          );
        });
        
        return forkJoin(createRequests).pipe(
          map(results => {
            // Filter out any failed item creations and ensure proper typing
            const successfulItems = results.filter((item): item is RPCPPEItem => item !== null);
            console.log('All items processed:', successfulItems);
            
            return {
              ...savedRPCPPE,
              items: successfulItems
            } as RPCPPE;
          }),
          catchError(error => {
            console.error('Error saving RPCPPE items:', error);
            // Return the RPCPPE without items if there's an error
            return of({
              ...savedRPCPPE,
              items: []
            } as RPCPPE);
          })
        );
      }),
      catchError(error => {
        console.error('Error in createRPCPPE:', error);
        // Log the full error response
        if (error.error) {
          console.error('Server error details:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  updateRPCPPE(id: string, rpcppe: Omit<RPCPPE, 'id'>): Observable<RPCPPE> {
    if (environment.use === 'local') {
      const rpcppeList = JSON.parse(localStorage.getItem('rpcppe') || '[]');
      const index = rpcppeList.findIndex((r: RPCPPE) => r.id === id);
      if (index !== -1) {
        const allItems = JSON.parse(localStorage.getItem('rpcppe_items') || '[]');
        const filteredItems = allItems.filter((item: RPCPPEItem) => item.rpcppeId !== id);
        const newItems = rpcppe.items.map(item => ({
          ...item,
          id: item.id || 'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          rpcppeId: id
        }));
        
        localStorage.setItem('rpcppe_items', JSON.stringify([...filteredItems, ...newItems]));

        const updatedRPCPPE = { ...rpcppe, id, items: newItems };
        rpcppeList[index] = updatedRPCPPE;
        localStorage.setItem('rpcppe', JSON.stringify(rpcppeList));
        
        return of(updatedRPCPPE);
      }
      return throwError(() => new Error('RPCPPE not found'));
    }
    
    // Extract items from the update data
    const { items, ...rpcppeData } = rpcppe;
    
    // Convert camelCase to snake_case for backend API
    const formattedRpcppeData = {
      rpcppe_no: rpcppeData.rpcppeNo,
      entity_name: rpcppeData.entityName,
      fund_cluster: rpcppeData.fundCluster,
      accountable_officer: rpcppeData.accountableOfficer,
      designation: rpcppeData.designation,
      accountability_date: rpcppeData.accountabilityDate,
      date: rpcppeData.date,
      total_value: rpcppeData.totalValue,
      remarks: rpcppeData.remarks,
      status: rpcppeData.status
    };
    
    // Update main RPCPPE first
    return this.http.put<RPCPPE>(`${this.rpcppeApiUrl}/${id}`, formattedRpcppeData).pipe(
      switchMap(updatedRPCPPE => {
        // If no items to update, just return the updated RPCPPE
        if (!items || items.length === 0) {
          return of({
            ...updatedRPCPPE,
            items: []
          });
        }
        
        // Get existing items
        return this.http.get<any[]>(this.rpcppeItemsApiUrl).pipe(
          switchMap(allItems => {
            // First delete existing items for this RPCPPE by sending DELETE requests
            const existingItems = allItems.filter(item => 
              item.rpcppe_id === id || item.rpcppeId === id
            );
            
            const deleteRequests = existingItems.map(item => 
              this.http.delete(`${this.rpcppeItemsApiUrl}/${item.id}`).pipe(
                catchError(() => of(null)) // Ignore errors on delete
              )
            );
            
            // After deleting existing items, create the new ones
            return (deleteRequests.length > 0 ? forkJoin(deleteRequests) : of([])).pipe(
              switchMap(() => {
                // Create new items one by one
                const createRequests = items.map(item => {
                  const newItem = {
                    article: item.article,
                    description: item.description,
                    property_no: item.propertyNo,
                    quantity: item.quantity,
                    unit_value: item.unitValue,
                    total_value: item.totalValue,
                    shortage_qty: item.shortageQty,
                    shortage_value: item.shortageValue,
                    remarks: item.remarks,
                    rpcppe_id: id // Ensure we use the correct property name for the backend
                  };
                  return this.http.post(this.rpcppeItemsApiUrl, newItem).pipe(
                    catchError(error => {
                      console.error('Error creating RPCPPE item:', error);
                      return of(null);
                    })
                  );
                });
                
                return forkJoin(createRequests).pipe(
                  map(() => {
                    return {
                      ...updatedRPCPPE,
                      items: items
                    };
                  })
                );
              })
            );
          }),
          catchError(error => {
            console.error('Error updating RPCPPE items:', error);
            return of({
              ...updatedRPCPPE,
              items: []
            });
          })
        );
      })
    );
  }

  deleteRPCPPE(id: string): Observable<any> {
    if (environment.use === 'local') {
      const rpcppeList = JSON.parse(localStorage.getItem('rpcppe') || '[]');
      const index = rpcppeList.findIndex((r: RPCPPE) => r.id === id);
      if (index !== -1) {
        const deletedRPCPPE = rpcppeList.splice(index, 1)[0];
        localStorage.setItem('rpcppe', JSON.stringify(rpcppeList));
        return of(deletedRPCPPE);
      }
      return throwError(() => new Error('RPCPPE not found'));
    }
    
    // Delete RPCPPE - the items should be deleted automatically due to CASCADE constraint
    return this.http.delete(`${this.rpcppeApiUrl}/${id}`);
  }

  // IIRUP Methods
  async getAllIIRUP(): Promise<IIRUP[]> {
    if (environment.use === 'local') {
      const iirupList = JSON.parse(localStorage.getItem('iirup') || '[]');
      const items = JSON.parse(localStorage.getItem('iirup_items') || '[]');
      
      return iirupList.map((iirup: IIRUP) => ({
        ...iirup,
        items: items.filter((item: IIRUPItem) => item.iirupId === iirup.id)
      }));
    }
    return this.crudService.getAll(IIRUP);
  }

  async getIIRUP(id: string): Promise<IIRUP | undefined> {
    if (environment.use === 'local') {
      const iirupList = JSON.parse(localStorage.getItem('iirup') || '[]');
      const items = JSON.parse(localStorage.getItem('iirup_items') || '[]');
      const iirup = iirupList.find((r: IIRUP) => r.id === id);
      if (iirup) {
        return {
          ...iirup,
          items: items.filter((item: IIRUPItem) => item.iirupId === id)
        };
      }
      return undefined;
    }
    return this.crudService.get(IIRUP, id);
  }

  async createIIRUP(iirup: Omit<IIRUP, 'id'>): Promise<IIRUP> {
    if (environment.use === 'local') {
      const iirupList = JSON.parse(localStorage.getItem('iirup') || '[]');
      const newIIRUP = {
        ...iirup,
        id: 'IIRUP-' + Date.now(),
        items: []
      };
      iirupList.push(newIIRUP);
      localStorage.setItem('iirup', JSON.stringify(iirupList));
      return newIIRUP;
    }
    return this.crudService.create(IIRUP, iirup);
  }

  async updateIIRUP(id: string, iirup: Omit<IIRUP, 'id'>): Promise<IIRUP> {
    if (environment.use === 'local') {
      const iirupList = JSON.parse(localStorage.getItem('iirup') || '[]');
      const index = iirupList.findIndex((r: IIRUP) => r.id === id);
      if (index !== -1) {
        const allItems = JSON.parse(localStorage.getItem('iirup_items') || '[]');
        const filteredItems = allItems.filter((item: IIRUPItem) => item.iirupId !== id);
        const newItems = iirup.items.map(item => ({
          ...item,
          id: item.id || 'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          iirupId: id
        }));
        
        localStorage.setItem('iirup_items', JSON.stringify([...filteredItems, ...newItems]));

        const updatedIIRUP = { ...iirup, id, items: newItems };
        iirupList[index] = updatedIIRUP;
        localStorage.setItem('iirup', JSON.stringify(iirupList));
        
        return updatedIIRUP;
      }
      throw new Error('IIRUP not found');
    }
    return this.crudService.update(IIRUP, id, iirup);
  }

  async deleteIIRUP(id: string): Promise<IIRUP | undefined> {
    if (environment.use === 'local') {
      const iirupList = JSON.parse(localStorage.getItem('iirup') || '[]');
      const index = iirupList.findIndex((r: IIRUP) => r.id === id);
      if (index !== -1) {
        const deletedIIRUP = iirupList.splice(index, 1)[0];
        localStorage.setItem('iirup', JSON.stringify(iirupList));
        return deletedIIRUP;
      }
      return undefined;
    }
    return this.crudService.delete(IIRUP, id);
  }

  // PTR Methods
  async getAllPTR(): Promise<PTR[]> {
    if (environment.use === 'local') {
      const ptrList = JSON.parse(localStorage.getItem('ptr') || '[]');
      const items = JSON.parse(localStorage.getItem('ptr_items') || '[]');
      
      return ptrList.map((ptr: PTR) => ({
        ...ptr,
        items: items.filter((item: PTRItem) => item.ptrId === ptr.id)
      }));
    }
    return this.crudService.getAll(PTR);
  }

  async getPTR(id: string): Promise<PTR | undefined> {
    if (environment.use === 'local') {
      const ptrList = JSON.parse(localStorage.getItem('ptr') || '[]');
      const items = JSON.parse(localStorage.getItem('ptr_items') || '[]');
      const ptr = ptrList.find((r: PTR) => r.id === id);
      if (ptr) {
        return {
          ...ptr,
          items: items.filter((item: PTRItem) => item.ptrId === id)
        };
      }
      return undefined;
    }
    return this.crudService.get(PTR, id);
  }

  async createPTR(ptr: Omit<PTR, 'id'>): Promise<PTR> {
    if (environment.use === 'local') {
      const ptrList = JSON.parse(localStorage.getItem('ptr') || '[]');
      const newPTR = {
        ...ptr,
        id: 'PTR-' + Date.now(),
        items: []
      };
      ptrList.push(newPTR);
      localStorage.setItem('ptr', JSON.stringify(ptrList));
      return newPTR;
    }
    return this.crudService.create(PTR, ptr);
  }

  async updatePTR(id: string, ptr: Omit<PTR, 'id'>): Promise<PTR> {
    if (environment.use === 'local') {
      const ptrList = JSON.parse(localStorage.getItem('ptr') || '[]');
      const index = ptrList.findIndex((r: PTR) => r.id === id);
      if (index !== -1) {
        const allItems = JSON.parse(localStorage.getItem('ptr_items') || '[]');
        const filteredItems = allItems.filter((item: PTRItem) => item.ptrId !== id);
        const newItems = ptr.items.map(item => ({
          ...item,
          id: item.id || 'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          ptrId: id
        }));
        
        localStorage.setItem('ptr_items', JSON.stringify([...filteredItems, ...newItems]));

        const updatedPTR = { ...ptr, id, items: newItems };
        ptrList[index] = updatedPTR;
        localStorage.setItem('ptr', JSON.stringify(ptrList));
        
        return updatedPTR;
      }
      throw new Error('PTR not found');
    }
    return this.crudService.update(PTR, id, ptr);
  }

  async deletePTR(id: string): Promise<PTR | undefined> {
    if (environment.use === 'local') {
      const ptrList = JSON.parse(localStorage.getItem('ptr') || '[]');
      const index = ptrList.findIndex((r: PTR) => r.id === id);
      if (index !== -1) {
        const deletedPTR = ptrList.splice(index, 1)[0];
        localStorage.setItem('ptr', JSON.stringify(ptrList));
        return deletedPTR;
      }
      return undefined;
    }
    return this.crudService.delete(PTR, id);
  }

  // PAR Methods
  async getAllPAR(): Promise<PAR[]> {
    if (environment.use === 'local') {
      const parList = JSON.parse(localStorage.getItem('par') || '[]');
      const items = JSON.parse(localStorage.getItem('par_items') || '[]');
      
      return parList.map((par: PAR) => ({
        ...par,
        items: items.filter((item: PARItem) => item.parId === par.id)
      }));
    }
    return this.crudService.getAll(PAR);
  }

  async getPAR(id: string): Promise<PAR | undefined> {
    if (environment.use === 'local') {
      const parList = JSON.parse(localStorage.getItem('par') || '[]');
      const items = JSON.parse(localStorage.getItem('par_items') || '[]');
      const par = parList.find((r: PAR) => r.id === id);
      if (par) {
        return {
          ...par,
          items: items.filter((item: PARItem) => item.parId === id)
        };
      }
      return undefined;
    }
    return this.crudService.get(PAR, id);
  }

  async createPAR(par: Omit<PAR, 'id'>): Promise<PAR> {
    if (environment.use === 'local') {
      const parList = JSON.parse(localStorage.getItem('par') || '[]');
      const newPAR = {
        ...par,
        id: 'PAR-' + Date.now(),
        items: []
      };
      parList.push(newPAR);
      localStorage.setItem('par', JSON.stringify(parList));
      return newPAR;
    }
    return this.crudService.create(PAR, par);
  }

  async updatePAR(id: string, par: Omit<PAR, 'id'>): Promise<PAR> {
    if (environment.use === 'local') {
      const parList = JSON.parse(localStorage.getItem('par') || '[]');
      const index = parList.findIndex((r: PAR) => r.id === id);
      if (index !== -1) {
        const allItems = JSON.parse(localStorage.getItem('par_items') || '[]');
        const filteredItems = allItems.filter((item: PARItem) => item.parId !== id);
        const newItems = par.items.map(item => ({
          ...item,
          id: item.id || 'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          parId: id
        }));
        
        localStorage.setItem('par_items', JSON.stringify([...filteredItems, ...newItems]));

        const updatedPAR = { ...par, id, items: newItems };
        parList[index] = updatedPAR;
        localStorage.setItem('par', JSON.stringify(parList));
        
        return updatedPAR;
      }
      throw new Error('PAR not found');
    }
    return this.crudService.update(PAR, id, par);
  }

  async deletePAR(id: string): Promise<PAR | undefined> {
    if (environment.use === 'local') {
      const parList = JSON.parse(localStorage.getItem('par') || '[]');
      const index = parList.findIndex((r: PAR) => r.id === id);
      if (index !== -1) {
        const deletedPAR = parList.splice(index, 1)[0];
        localStorage.setItem('par', JSON.stringify(parList));
        return deletedPAR;
      }
      return undefined;
    }
    return this.crudService.delete(PAR, id);
  }

  // RLSDDP Methods
  async getAllRLSDDP(): Promise<RLSDDP[]> {
    if (environment.use === 'local') {
      const rlsddpList = JSON.parse(localStorage.getItem('rlsddp') || '[]');
      const items = JSON.parse(localStorage.getItem('rlsddp_items') || '[]');
      
      return rlsddpList.map((rlsddp: RLSDDP) => ({
        ...rlsddp,
        items: items.filter((item: RLSDDPItem) => item.rlsddpId === rlsddp.id)
      }));
    }
    return this.crudService.getAll(RLSDDP);
  }

  async getRLSDDP(id: string): Promise<RLSDDP | undefined> {
    if (environment.use === 'local') {
      const rlsddpList = JSON.parse(localStorage.getItem('rlsddp') || '[]');
      const items = JSON.parse(localStorage.getItem('rlsddp_items') || '[]');
      const rlsddp = rlsddpList.find((r: RLSDDP) => r.id === id);
      if (rlsddp) {
        return {
          ...rlsddp,
          items: items.filter((item: RLSDDPItem) => item.rlsddpId === id)
        };
      }
      return undefined;
    }
    return this.crudService.get(RLSDDP, id);
  }

  async createRLSDDP(rlsddp: Omit<RLSDDP, 'id'>): Promise<RLSDDP> {
    if (environment.use === 'local') {
      const rlsddpList = JSON.parse(localStorage.getItem('rlsddp') || '[]');
      const newRLSDDP = {
        ...rlsddp,
        id: 'RLSDDP-' + Date.now(),
        items: rlsddp.items.map(item => ({
          ...item,
          id: 'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          rlsddpId: 'RLSDDP-' + Date.now()
        }))
      };

      // Save items
      const existingItems = JSON.parse(localStorage.getItem('rlsddp_items') || '[]');
      localStorage.setItem('rlsddp_items', JSON.stringify([...existingItems, ...newRLSDDP.items]));

      // Save RLSDDP
      rlsddpList.push(newRLSDDP);
      localStorage.setItem('rlsddp', JSON.stringify(rlsddpList));
      
      return newRLSDDP;
    }
    return this.crudService.create(RLSDDP, rlsddp);
  }

  async updateRLSDDP(id: string, rlsddp: Omit<RLSDDP, 'id'>): Promise<RLSDDP> {
    if (environment.use === 'local') {
      const rlsddpList = JSON.parse(localStorage.getItem('rlsddp') || '[]');
      const index = rlsddpList.findIndex((r: RLSDDP) => r.id === id);
      if (index !== -1) {
        const allItems = JSON.parse(localStorage.getItem('rlsddp_items') || '[]');
        const filteredItems = allItems.filter((item: RLSDDPItem) => item.rlsddpId !== id);
        const newItems = rlsddp.items.map(item => ({
          ...item,
          id: item.id || 'ITEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          rlsddpId: id
        }));
        
        localStorage.setItem('rlsddp_items', JSON.stringify([...filteredItems, ...newItems]));

        const updatedRLSDDP = { ...rlsddp, id, items: newItems };
        rlsddpList[index] = updatedRLSDDP;
        localStorage.setItem('rlsddp', JSON.stringify(rlsddpList));
        
        return updatedRLSDDP;
      }
      throw new Error('RLSDDP not found');
    }
    return this.crudService.update(RLSDDP, id, rlsddp);
  }

  async deleteRLSDDP(id: string): Promise<RLSDDP | undefined> {
    if (environment.use === 'local') {
      const rlsddpList = JSON.parse(localStorage.getItem('rlsddp') || '[]');
      const index = rlsddpList.findIndex((r: RLSDDP) => r.id === id);
      if (index !== -1) {
        const deletedRLSDDP = rlsddpList.splice(index, 1)[0];
        localStorage.setItem('rlsddp', JSON.stringify(rlsddpList));

        // Also delete associated items
        const allItems = JSON.parse(localStorage.getItem('rlsddp_items') || '[]');
        const remainingItems = allItems.filter((item: RLSDDPItem) => item.rlsddpId !== id);
        localStorage.setItem('rlsddp_items', JSON.stringify(remainingItems));

        return deletedRLSDDP;
      }
      return undefined;
    }
    return this.crudService.delete(RLSDDP, id);
  }
} 