import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, noop } from 'rxjs';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    const http$ = Observable.create((observer) => {
      fetch('api/courses')
        .then((response) => {
          return response.json();
        })
        .then((body) => {
          observer.next(body);
          observer.complete();
        })
        .catch((err) => {
          observer.errror(err);
        });
    });

    http$.subscribe(
      (courses) => console.log('courses: ', courses),
      noop,
      () => console.log('completed')
    );
  }
}
