import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BIDE {
  id: number;
  number: string;
  requested_items: string[];
  supplier: string;
  amount_submitted: number;
  evaluation_due_date: string;
  bid_evaluation_status: string;
  date_created: string;
  status: string;
}

@Component({
  selector: 'app-bidevaluation-evaluate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidevaluation-evaluate.component.html',
  styleUrl: './bidevaluation-evaluate.component.css'
})
export class BidevaluationEvaluateComponent {
  @Input() bide: BIDE | null = null;
  @Output() closeModal = new EventEmitter<void>();

  evaluationCriteria = [
    {
      title: 'Bid Document',
      options: ['Not Submitted', 'Incomplete', 'Complete'],
      selected: ''
    },
    {
      title: 'Bidder Experience',
      options: ['Experienced but Not Related', 'Similar or Comparable', 'Very Similar'],
      selected: ''
    },
    {
      title: 'Clarity of Proposal',
      options: ['Poor and Standard', 'Acceptable', 'Excellent'],
      selected: ''
    },
    {
      title: 'Timeframe for Delivery',
      options: ['Beyond Required', 'Slightly Delayed', 'On-time'],
      selected: ''
    },
    {
      title: 'Overall Appearance',
      options: ['Simply Presented', 'Neatly Documented', 'Very Detailed'],
      selected: ''
    }
  ];

  additionalComments: string = '';

  getPoints(option: string): string {
    const pointsMap: { [key: string]: string } = {
      // Bid Document
      'Not Submitted': '0',
      'Incomplete': '1',
      'Complete': '2',
      // Bidder Experience
      'Experienced but Not Related': '0',
      'Similar or Comparable': '1',
      'Very Similar': '2',
      // Clarity of Proposal
      'Poor and Standard': '0',
      'Acceptable': '1',
      'Excellent': '2',
      // Timeframe for Delivery
      'Beyond Required': '0',
      'Slightly Delayed': '1',
      'On-time': '2',
      // Overall Appearance
      'Simply Presented': '0',
      'Neatly Documented': '1',
      'Very Detailed': '2'
    };
    return pointsMap[option];
  }

  calculateTotalScore(): number {
    return this.evaluationCriteria.reduce((total, criteria) => {
      if (criteria.selected) {
        const points = parseInt(this.getPoints(criteria.selected));
        return total + points;
      }
      return total;
    }, 0);
  }

  getMaxPossibleScore(): number {
    return this.evaluationCriteria.length * 2; // Each criteria has max 2 points
  }

  confirm() {
    const totalScore = this.calculateTotalScore();
    console.log('Total Score:', totalScore);
    this.closeModal.emit();
  }
}
