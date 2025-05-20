import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export interface SignatureModalData<T> {
  id: keyof T,
  data: T,
  show:boolean,
  title?:string;
  description?:string;
  submit: (signed:T)=>void
}

@Component({
  selector: 'app-signature-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule],
  templateUrl: './signature-modal.component.html',
  styleUrl: './signature-modal.component.scss'
})
export class SignatureModalComponent<T> {
  @Input() config: SignatureModalData<T>; // Controls p-dialog visibility
  signatureData: string | null = null;
  canvas: HTMLCanvasElement | undefined;
  context: CanvasRenderingContext2D | null = null;
  isDrawing = false;

  ngOnInit() {
    // Canvas will be initialized when modal opens
    this.clearSignature();
    this.initializeCanvas();
  }

  initializeCanvas() {
    setTimeout(() => {
      this.canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
      this.context = this.canvas.getContext('2d');
      if (this.context) {
        this.context.lineWidth = 2;
        this.context.lineCap = 'round';
        this.context.strokeStyle = '#000';
      }
    }, 0);
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.context?.beginPath();
    this.context?.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing || !this.context) return;
    this.context.lineTo(event.offsetX, event.offsetY);
    this.context.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearSignature() {
    this.context?.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    this.signatureData = null;
  }

  saveSignature() {
    this.signatureData = this.canvas!.toDataURL('image/png');
    this.config.data[this.config.id]= this.signatureData as T[keyof T];
    this.config.submit(this.config.data);
    this.config.show = false;
    this.clearSignature();
  }

  cancel() {
    this.config.show = false;
    this.clearSignature();
  }

}