import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-d-viewppmpprocurement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './d-viewppmpprocurement.component.html',
  styleUrls: ['./d-viewppmpprocurement.component.css']
})
export class DViewppmpprocurementComponent implements OnInit {
  projectId: number | null = null;
  ppmpData: any = null;
  ppmpItems: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      this.loadPpmpData();
      this.loadPpmpItems();
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

  async loadPpmpItems(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpItemsByProjectId(this.projectId);
      if (error) {
        console.error('Error fetching PPMP items:', error);
      } else {
        this.ppmpItems = data;
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}
