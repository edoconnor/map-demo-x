import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private positionSubject = new BehaviorSubject<{latitude: number | undefined, longitude: number | undefined}>({latitude: undefined, longitude: undefined});
  public position$ = this.positionSubject.asObservable();

  constructor() { }

  setPosition(position: {latitude: number, longitude: number}) {
    this.positionSubject.next(position);
  }
}
