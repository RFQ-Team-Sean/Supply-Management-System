import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRolesandpermissionComponent } from './add-rolesandpermission.component';

describe('AddRolesandpermissionComponent', () => {
  let component: AddRolesandpermissionComponent;
  let fixture: ComponentFixture<AddRolesandpermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRolesandpermissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRolesandpermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
