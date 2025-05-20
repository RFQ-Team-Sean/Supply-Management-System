import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-trails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-trails.component.html',
  styleUrl: './audit-trails.component.scss'
})
export class AuditTrailsComponent implements AfterViewInit {
  quotes: string[] = [
    "If you're looking for a sign, this is it",
    "Be here now",
    "Create joy",
    "Stay in your power",
    "Go explore",
    "Be thankful for what you have now",
    "Simplify",
    "Let it go",
    "You are enough",
    "Keep fighting",
    "Practice love",
    "Be true",
    "Find your magic",
    "Roam",
    "Breathe",
    "Be patient",
    "Celebrate the victories",
    "Progress over perfection",
    "Trust yourself",
    "Let it come",
    "Every day is a new beginning",
    "Don’t give up",
    "You are loved",
    "Hold on",
    "What you seek is seeking you",
    "Pay attention",
    "Great things come from small steps",
    "Go outside",
    "Look within",
    "Imagine",
    "Keep going",
    "Stay curious",
    "Find peace",
    "Be kind",
    "Dream big",
    "Take risks",
    "Love deeply",
    "Stay humble",
    "Grow daily",
    "Be brave",
    "Shine bright",
    "Stay inspired",
    "Find joy",
    "Be gentle",
    "Keep learning",
    "Stay strong",
    "Embrace change",
    "Be present",
    "Find beauty",
    "Stay hopeful",
    "Keep dreaming",
    "Be authentic",
    "Find calm",
    "Stay focused",
    "Be grateful",
    "Keep pushing",
    "Stay positive",
    "Find balance",
    "Be fearless",
    "Keep exploring",
    "Stay grounded",
    "Find wonder",
    "Be yourself",
    "Keep believing",
    "Stay motivated",
    "Find strength",
    "Be happy",
    "Keep trying",
    "Stay determined",
    "Find clarity",
    "Be bold",
    "Keep moving",
    "Stay open",
    "Find magic",
    "Be free",
    "Keep growing",
    "Stay alive",
    "Find light",
    "Be unique",
    "Keep shining",
    "Stay calm",
  ];

  colors: string[] = [
    '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251', '#B565A7', '#FEBE7E', '#A8D5BA', '#F28C38',
    '#FFD700', '#FF4500', '#00CED1', '#FF1493', '#32CD32', '#4682B4', '#FF69B4', '#ADFF2F', '#DC143C', '#7B68EE',
    '#FF6347', '#20B2AA', '#FF00FF', '#9ACD32', '#4169E1', '#FFB6C1', '#98FB98', '#FF4500', '#BA55D3', '#FFA500',
    '#40E0D0', '#FFDEAD', '#DAA520', '#FF8C00', '#48D1CC', '#C71585', '#00FA9A', '#1E90FF', '#F4A460', '#9400D3'
  ];

  fonts: string[] = [
    'Caveat', 'Indie Flower', 'Architects Daughter', 'Amatic SC', 'Kalam', 'Neucha',
    'Shadows Into Light', 'Patrick Hand', 'Dancing Script', 'Satisfy', 'Covered By Your Grace',
    'Gochi Hand', 'Reenie Beanie', 'Sue Ellen Francisco', 'Love Ya Like A Sister',
    'Permanent Marker', 'Rock Salt', 'Gloria Hallelujah', 'Coming Soon', 'Schoolbell',
    'Crafty Girls', 'Just Me Again Down Here', 'Annie Use Your Telescope',
    'Waiting for the Sunrise', 'Special Elite', 'Homemade Apple', 'Nothing You Could Do',
    'La Belle Aurore', 'Give You Glory', 'Cedarville Cursive'
  ];

  paperShapes: string[] = [
    'polygon(5% 0%, 95% 0%, 100% 10%, 100% 90%, 95% 100%, 5% 100%, 0% 90%, 0% 10%)',
    'polygon(0% 5%, 90% 0%, 100% 15%, 95% 95%, 85% 100%, 10% 95%, 0% 85%)',
    'polygon(10% 0%, 100% 5%, 95% 90%, 85% 100%, 5% 95%, 0% 80%, 5% 10%)',
    'polygon(0% 15%, 15% 0%, 85% 5%, 100% 20%, 95% 85%, 80% 100%, 5% 90%)',
    'polygon(5% 10%, 95% 0%, 100% 20%, 90% 95%, 80% 100%, 5% 90%, 0% 80%)',
    'polygon(0% 5%, 85% 0%, 100% 10%, 95% 90%, 90% 100%, 10% 95%, 5% 85%)',
    'polygon(10% 0%, 90% 5%, 100% 15%, 95% 80%, 85% 100%, 5% 95%, 0% 20%)',
    'polygon(5% 0%, 95% 5%, 100% 15%, 90% 90%, 80% 100%, 15% 95%, 0% 85%)'
  ];

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  getRandomFont(): string {
    return this.fonts[Math.floor(Math.random() * this.fonts.length)];
  }

  getRandomPaperShape(): string {
    return this.paperShapes[Math.floor(Math.random() * this.paperShapes.length)];
  }

  getRandomRotation(): string {
    return `rotate(${Math.floor(Math.random() * 30) - 15}deg)`;
  }

  ngAfterViewInit(): void {
    // Cast quotes to NodeListOf<HTMLElement>
    const quotes = document.querySelectorAll('.quote') as NodeListOf<HTMLElement>;
    const container = document.querySelector('.quote-container') as HTMLElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const cols = 8;
    const rows = Math.ceil(quotes.length / cols);
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;

    quotes.forEach((quote: HTMLElement, index: number) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cellWidth;
      const y = row * cellHeight;

      const offsetX = (Math.random() * 20 - 10);
      const offsetY = (Math.random() * 20 - 10);

      quote.style.left = `${x + offsetX}px`;
      quote.style.top = `${y + offsetY}px`;
      quote.style.width = `${cellWidth - 10}px`;
      quote.style.height = `${cellHeight - 10}px`;
    });
  }
}