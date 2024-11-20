import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRolesandpermissionComponent } from './edit-rolesandpermission.component';

describe('EditRolesandpermissionComponent', () => {
  let component: EditRolesandpermissionComponent;
  let fixture: ComponentFixture<EditRolesandpermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRolesandpermissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRolesandpermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
