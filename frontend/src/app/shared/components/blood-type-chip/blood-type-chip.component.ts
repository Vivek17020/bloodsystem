import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-blood-type-chip',
  templateUrl: './blood-type-chip.component.html',
  styleUrls: ['./blood-type-chip.component.scss'],
})
export class BloodTypeChipComponent {
  @Input() bloodType = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
