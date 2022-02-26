import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, concat, forkJoin, fromEvent, merge } from 'rxjs';
import { RxJsLoggingLevel, debug } from '../common/debug';
import {
  concatAll,
  concatMap,
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import { Course } from '../model/course';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { searchLessons } from '../../../server/search-lessons.route';
import { start } from 'repl';

@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
})
export class CourseComponent implements OnInit, AfterViewInit {
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  courseId: string;

  @ViewChild('searchInput', { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params['id'];
    // this.course$ = createHttpObservable(`/api/courses/${this.courseId}`).pipe(debug(RxJsLoggingLevel.INFO, 'course'));
    // this.lessons$ = createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100`).pipe(
    //   map((res) => res['payload'])
    // );
    // this.lessons$ = this.loadLessons();

    const course$ = createHttpObservable(`/api/courses/${this.courseId}`);
    const lessons$ = this.loadLessons();

    forkJoin(course$, lessons$)
      .pipe(
        tap(([course, lessons]) => {
          console.log(course);
          console.log(lessons);
        })
      )
      .subscribe();
  }

  ngAfterViewInit() {
    this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup').pipe(
      map((event) => event.target.value),
      debug(RxJsLoggingLevel.INFO, 'search'),
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((search) => this.loadLessons(search)),
      debug(RxJsLoggingLevel.INFO, 'lesson values: ')
    );
  }

  loadLessons(search = ''): Observable<Lesson[]> {
    return createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`).pipe(
      map((res) => res['payload'])
    );
  }
}
