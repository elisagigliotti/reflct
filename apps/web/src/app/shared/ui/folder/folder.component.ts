import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Cartella guardaroba ".folder" — icona 📁 + nome + conteggio. */
@Component({
  selector: 'app-folder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder.component.html',
  styleUrl: './folder.component.scss',
})
export class FolderComponent {
  @Input() name = '';
  @Input() count = 0;
}
