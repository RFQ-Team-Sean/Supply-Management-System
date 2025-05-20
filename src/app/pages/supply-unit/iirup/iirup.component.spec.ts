import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IIRUPComponent } from './iirup.component';

describe('IIRUPComponent', () => {
    let component: IIRUPComponent;
    let fixture: ComponentFixture<IIRUPComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IIRUPComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(IIRUPComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
}); 