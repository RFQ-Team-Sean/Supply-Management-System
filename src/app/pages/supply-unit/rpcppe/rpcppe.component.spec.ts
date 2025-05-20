import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RPCPPEComponent } from './rpcppe.component';

describe('RPCPPEComponent', () => {
    let component: RPCPPEComponent;
    let fixture: ComponentFixture<RPCPPEComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RPCPPEComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(RPCPPEComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
}); 