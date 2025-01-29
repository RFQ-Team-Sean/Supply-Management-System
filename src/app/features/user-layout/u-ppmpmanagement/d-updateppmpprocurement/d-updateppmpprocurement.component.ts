import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-d-updateppmpprocurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-updateppmpprocurement.component.html',
  styleUrls: ['./d-updateppmpprocurement.component.css']
})
export class DUpdateppmpprocurementComponent implements OnInit {
  projectId: number | null = null;
  ppmpData: any = null;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      this.loadPpmpData();
    });
  }

  async loadPpmpData(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpById(this.projectId);
      if (error) {
        console.error('Error fetching PPMP data:', error);
      } else {
        this.ppmpData = data;
      }
    }
  }

  async updatePpmp(): Promise<void> {
    if (this.ppmpData && this.projectId !== null) {
      const { data, error } = await this.supabaseService.updatePpmp(this.projectId, this.ppmpData);
      if (error) {
        console.error('Error updating PPMP data:', error);
      } else {
        console.log('PPMP data updated successfully:', data);
      }
    }
  }

  goBack() {
    this.location.back();
  }
}
