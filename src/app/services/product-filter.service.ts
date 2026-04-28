import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductFilterService {
  private searchTermSubject = new BehaviorSubject<string>('');
  private minPriceSubject = new BehaviorSubject<number | null>(null);
  private maxPriceSubject = new BehaviorSubject<number | null>(null);

  searchTerm$ = this.searchTermSubject.asObservable();
  minPrice$ = this.minPriceSubject.asObservable();
  maxPrice$ = this.maxPriceSubject.asObservable();

  setSearchTerm(value: string) {
    this.searchTermSubject.next(value);
  }

  setPriceRange(minPrice: number | null, maxPrice: number | null) {
    this.minPriceSubject.next(minPrice);
    this.maxPriceSubject.next(maxPrice);
  }

  getCurrentFilters() {
    return {
      searchTerm: this.searchTermSubject.value,
      minPrice: this.minPriceSubject.value,
      maxPrice: this.maxPriceSubject.value
    };
  }
}
