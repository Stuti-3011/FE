import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface SizeChartRow {
  size: string;
  chest: string;
  waist: string;
  hip: string;
}

@Component({
  selector: 'app-size-chart-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './size-chart-dialog.component.html',
  styleUrl: './size-chart-dialog.component.css'
})
export class SizeChartDialogComponent {
  readonly rows: SizeChartRow[];

  constructor(
    private dialogRef: MatDialogRef<SizeChartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { availableSizes: string[] }
  ) {
    const defaultRows: Record<string, SizeChartRow> = {
      XS: { size: 'XS', chest: '32-34', waist: '26-28', hip: '34-36' },
      S: { size: 'S', chest: '34-36', waist: '28-30', hip: '36-38' },
      M: { size: 'M', chest: '36-38', waist: '30-32', hip: '38-40' },
      L: { size: 'L', chest: '38-40', waist: '32-34', hip: '40-42' },
      XL: { size: 'XL', chest: '40-42', waist: '34-36', hip: '42-44' },
      XXL: { size: 'XXL', chest: '42-45', waist: '36-39', hip: '44-47' }
    };

    this.rows = (data.availableSizes.length ? data.availableSizes : Object.keys(defaultRows)).map((size) => {
      const key = size.toUpperCase();
      return defaultRows[key] ?? { size, chest: '-', waist: '-', hip: '-' };
    });
  }

  close() {
    this.dialogRef.close();
  }
}
