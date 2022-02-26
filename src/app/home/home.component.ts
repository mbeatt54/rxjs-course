import { Component, OnInit } from '@angular/core';
import { Observable, noop, of, throwError, timer } from 'rxjs';
import { catchError, delayWhen, finalize, map, retry, retryWhen, shareReplay, tap } from 'rxjs/operators';

import { Course } from '../model/course';
import { createHttpObservable } from '../common/util';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  constructor() {}

  ngOnInit() {
    const http$ = createHttpObservable('api/courses');

    const courses$: Observable<Course[]> = http$.pipe(
      // catchError((err) =>
      //   // of([
      //   //   // {
      //   //   //   id: 0,
      //   //   //   description: 'RxJs In Practice Course',
      //   //   //   iconUrl: 'https://s3-us-west-1.amazonaws.com/angular-university/course-images/rxjs-in-practice-course.png',
      //   //   //   courseListIcon: 'https://angular-academy.s3.amazonaws.com/main-logo/main-page-logo-small-hat.png',
      //   //   //   longDescription: 'Understand the RxJs Observable pattern, learn the RxJs Operators via practical examples',
      //   //   //   category: 'BEGINNER',
      //   //   //   lessonsCount: 10,
      //   //   // },
      //   // ])
      //   {
      //     console.log('An error occured', err);
      //     return throwError(err);
      //   }
      // ),
      // finalize(() => console.log('calling finalize()...')),
      tap(() => console.log('HTTP request executed')),
      map((res) => Object.values(res['payload'])),
      shareReplay(),
      retryWhen((error) => error.pipe(delayWhen(() => timer(2000))))
    );

    this.beginnerCourses$ = courses$.pipe(map((courses) => courses.filter((course) => course.category == 'BEGINNER')));
    this.advancedCourses$ = courses$.pipe(map((courses) => courses.filter((course) => course.category == 'ADVANCED')));
  }
}
