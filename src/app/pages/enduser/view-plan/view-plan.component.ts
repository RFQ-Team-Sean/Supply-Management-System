import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-view-plan',
  standalone: true,
  imports: [CardModule],
  templateUrl: './view-plan.component.html',
  styleUrl: './view-plan.component.scss',
})
export class ViewPlanComponent implements OnInit {
  planId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.planId = this.route.snapshot.paramMap.get('id');
    // Fetch plan details from the backend using this.planId
  }
}