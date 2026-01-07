
import { CalendarEvent } from './calendar-utils';

// MOCK DATA - Moved to shared file for API access
export const MOCK_EVENTS: CalendarEvent[] = [
  // UQ Dates 2026 (Source: Official HTML)
  // Semester 1
  {
    id: 'uq-s1-timetable',
    title: 'Class Timetable Released',
    start: new Date(2026, 0, 12), // Jan 12
    allDay: true,
    category: 'UQ',
    type: 'Admin',
    description: 'Class Timetable available to students',
    priority: 1
  },
  {
    id: 'uq-s1-qtac',
    title: 'QTAC Major Offer Round',
    start: new Date(2026, 0, 15), // Jan 15
    allDay: true,
    category: 'UQ',
    type: 'Admin',
    description: 'QTAC major offer round',
    priority: 1
  },
  {
      id: 'uq-s1-enrol-dom',
      title: 'Due date to enrol (Domestic)',
      start: new Date(2026, 0, 30), // Jan 30
      allDay: true,
      category: 'UQ',
      type: 'Admin',
      description: 'Due date to enrol – domestic students',
      priority: 2
  },
  {
    id: 'uq-s1-oweek',
    title: 'Orientation Week (Sem 1)',
    start: new Date(2026, 1, 16), // Feb 16
    end: new Date(2026, 1, 20), // Feb 20
    allDay: true,
    category: 'UQ',
    type: 'Admin',
    description: 'Orientation Week for new students',
    priority: 2
  },
  {
      id: 'uq-s1-enrol-int',
      title: 'Due date to enrol (International)',
      start: new Date(2026, 1, 20), // Feb 20
      allDay: true,
      category: 'UQ',
      type: 'Admin',
      description: 'Due date to enrol – international students',
      priority: 2
  },
  {
    id: 'uq-s1-start',
    title: 'Semester 1 Classes Start',
    start: new Date(2026, 1, 23), // Feb 23
    allDay: true,
    category: 'UQ',
    type: 'Lecture',
    description: 'First day of classes for Semester 1',
    priority: 3
  },
  {
    id: 'uq-s1-census',
    title: 'Semester 1 Census Date',
    start: new Date(2026, 2, 31), // Mar 31
    allDay: true,
    category: 'UQ',
    type: 'Admin',
    description: 'Last date to withdraw without financial liability',
    priority: 3
  },
  {
    id: 'uq-s1-break',
    title: 'Mid-Semester Break',
    start: new Date(2026, 3, 6), // Apr 6
    end: new Date(2026, 3, 10), // Apr 10
    allDay: true,
    category: 'UQ',
    type: 'Other',
    description: 'Universities Australia Common Vacation Week',
    priority: 1
  },
  {
      id: 'uq-s1-exam-sat1',
      title: 'Saturday Exams',
      start: new Date(2026, 3, 18), // Apr 18
      allDay: true,
      category: 'UQ',
      type: 'Exam',
      description: 'In-semester Saturday examinations',
      priority: 2
  },
  {
    id: 'uq-s1-classes-end',
    title: 'Semester 1 Classes End',
    start: new Date(2026, 4, 29), // May 29
    allDay: true,
    category: 'UQ',
    type: 'Lecture',
    description: 'Last day of classes for Semester 1',
    priority: 2
  },
  {
    id: 'uq-s1-revision',
    title: 'Revision Period',
    start: new Date(2026, 5, 1), // Jun 1
    end: new Date(2026, 5, 5), // Jun 5
    allDay: true,
    category: 'UQ',
    type: 'Other',
    description: 'Study week before exams',
    priority: 1
  },
  {
    id: 'uq-s1-exams',
    title: 'Examination Period (Sem 1)',
    start: new Date(2026, 5, 6), // Jun 6
    end: new Date(2026, 5, 20), // Jun 20
    allDay: true,
    category: 'UQ',
    type: 'Exam',
    description: 'Official Examination Period',
    priority: 3
  },
  {
      id: 'uq-s1-end',
      title: 'Semester 1 Ends',
      start: new Date(2026, 5, 20), // Jun 20
      allDay: true,
      category: 'UQ',
      type: 'Other',
      description: 'End of Semester 1',
      priority: 1
  },

  // Semester 2
  {
      id: 'uq-s2-oweek',
      title: 'Mid-Year Orientation Week',
      start: new Date(2026, 6, 20), // Jul 20
      end: new Date(2026, 6, 24), // Jul 24
      allDay: true,
      category: 'UQ',
      type: 'Admin',
      description: 'Orientation for Semester 2',
      priority: 1
  },
  {
    id: 'uq-s2-start',
    title: 'Semester 2 Classes Start',
    start: new Date(2026, 6, 27), // Jul 27
    allDay: true,
    category: 'UQ',
    type: 'Lecture',
    description: 'First day of classes for Semester 2',
    priority: 3
  },
  {
      id: 'uq-s2-ekka',
      title: 'Ekka Holiday (St Lucia)',
      start: new Date(2026, 7, 12), // Aug 12
      allDay: true,
      category: 'UQ',
      type: 'Holiday',
      description: 'Royal Queensland Show - St Lucia Closed',
      priority: 2
  },
  {
    id: 'uq-s2-census',
    title: 'Semester 2 Census Date',
    start: new Date(2026, 7, 31), // Aug 31
    allDay: true,
    category: 'UQ',
    type: 'Admin',
    description: 'Last date to withdraw without financial liability',
    priority: 3
  },
  {
    id: 'uq-s2-break',
    title: 'Mid-Semester Break',
    start: new Date(2026, 8, 28), // Sep 28
    end: new Date(2026, 9, 2), // Oct 2
    allDay: true,
    category: 'UQ',
    type: 'Other',
    description: 'Universities Australia Common Vacation Week',
    priority: 1
  },
  {
    id: 'uq-s2-classes-end',
    title: 'Semester 2 Classes End',
    start: new Date(2026, 9, 30), // Oct 30
    allDay: true,
    category: 'UQ',
    type: 'Lecture',
    description: 'Last day of classes for Semester 2',
    priority: 2
  },
  {
    id: 'uq-s2-revision',
    title: 'Revision Period',
    start: new Date(2026, 10, 2), // Nov 2
    end: new Date(2026, 10, 6), // Nov 6
    allDay: true,
    category: 'UQ',
    type: 'Other',
    description: 'Study week before exams',
    priority: 1
  },
  {
    id: 'uq-s2-exams',
    title: 'Examination Period (Sem 2)',
    start: new Date(2026, 10, 7), // Nov 7
    end: new Date(2026, 10, 21), // Nov 21
    allDay: true,
    category: 'UQ',
    type: 'Exam',
    description: 'Official Examination Period',
    priority: 3
  },
  {
      id: 'uq-s2-graduations',
      title: 'Graduations',
      start: new Date(2026, 11, 9), // Dec 9
      end: new Date(2026, 11, 23), // Dec 23
      allDay: true,
      category: 'UQ',
      type: 'Admin',
      description: 'End of Year Graduation Ceremonies',
      priority: 1
  },
  
  // QLD Holidays 2026 (Source: QLD Govt Image)
  {
    id: 'qld-1',
    title: 'New Year\'s Day',
    start: new Date(2026, 0, 1),
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-2',
    title: 'Australia Day',
    start: new Date(2026, 0, 26), // Jan 26
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-3',
    title: 'Good Friday',
    start: new Date(2026, 3, 3), // Apr 3
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-4',
    title: 'Easter Saturday',
    start: new Date(2026, 3, 4), // Apr 4
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday (The day after Good Friday)',
    priority: 1
  },
  {
    id: 'qld-5',
    title: 'Easter Sunday',
    start: new Date(2026, 3, 5), // Apr 5
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-6',
    title: 'Easter Monday',
    start: new Date(2026, 3, 6), // Apr 6
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-7',
    title: 'Anzac Day',
    start: new Date(2026, 3, 25), // Apr 25
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-8',
    title: 'Labour Day',
    start: new Date(2026, 4, 4), // May 4
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-9',
    title: 'Royal Queensland Show (Ekka)',
    start: new Date(2026, 7, 12), // Aug 12 (Brisbane)
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday (Brisbane only)',
    priority: 1
  },
  {
    id: 'qld-10',
    title: 'King\'s Birthday',
    start: new Date(2026, 9, 5), // Oct 5
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-11',
    title: 'Christmas Eve (6pm-12am)',
    start: new Date(2026, 11, 24, 18, 0), // Dec 24 6pm
    end: new Date(2026, 11, 24, 23, 59),
    allDay: false,
    category: 'QLD',
    type: 'Holiday',
    description: 'Part-day Public Holiday',
    priority: 1
  },
  {
    id: 'qld-12',
    title: 'Christmas Day',
    start: new Date(2026, 11, 25), // Dec 25
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-13',
    title: 'Boxing Day',
    start: new Date(2026, 11, 26), // Dec 26
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday',
    priority: 1
  },
  {
    id: 'qld-14',
    title: 'Boxing Day Holiday',
    start: new Date(2026, 11, 28), // Dec 28 (Mon)
    allDay: true,
    category: 'QLD',
    type: 'Holiday',
    description: 'Public Holiday (Additional day)',
    priority: 1
  },

  // China Holidays 2026 (Source: Official Statement)
  // 1. New Year (元旦)
  {
    id: 'cn-newyear',
    title: 'New Year Holiday (元旦)',
    start: new Date(2026, 0, 1), // Jan 1
    end: new Date(2026, 0, 3), // Jan 3
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'New Year Holiday',
    priority: 2
  },
  {
      id: 'cn-newyear-work-1',
      title: 'Makeup Workday (New Year)',
      start: new Date(2026, 0, 4), // Jan 4 (Sun)
      allDay: true,
      category: 'CN',
      type: 'Other',
      description: 'Official Makeup Workday for New Year',
      priority: 1
  },

  // 2. Spring Festival (春节)
  {
      id: 'cn-spring-work-1',
      title: 'Makeup Workday (Spring Festival)',
      start: new Date(2026, 1, 14), // Feb 14 (Sat)
      allDay: true,
      category: 'CN',
      type: 'Other',
      description: 'Official Makeup Workday for Spring Festival',
      priority: 1
  },
  {
    id: 'cn-spring',
    title: 'Spring Festival (春节)',
    start: new Date(2026, 1, 15), // Feb 15
    end: new Date(2026, 1, 23), // Feb 23
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'Chinese New Year / Spring Festival Holiday',
    priority: 3
  },
  {
      id: 'cn-spring-work-2',
      title: 'Makeup Workday (Spring Festival)',
      start: new Date(2026, 1, 28), // Feb 28 (Sat)
      allDay: true,
      category: 'CN',
      type: 'Other',
      description: 'Official Makeup Workday for Spring Festival',
      priority: 1
  },

  // 3. Qingming Festival (清明节)
  {
    id: 'cn-qingming',
    title: 'Qingming Festival (清明节)',
    start: new Date(2026, 3, 4), // Apr 4
    end: new Date(2026, 3, 6), // Apr 6
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'Tomb Sweeping Day Holiday',
    priority: 2
  },

  // 4. Labor Day (劳动节)
  {
    id: 'cn-labor',
    title: 'Labor Day (劳动节)',
    start: new Date(2026, 4, 1), // May 1
    end: new Date(2026, 4, 5), // May 5
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'International Workers\' Day Holiday',
    priority: 2
  },
  {
      id: 'cn-labor-work-1',
      title: 'Makeup Workday (Labor Day)',
      start: new Date(2026, 4, 9), // May 9 (Sat)
      allDay: true,
      category: 'CN',
      type: 'Other',
      description: 'Official Makeup Workday for Labor Day',
      priority: 1
  },

  // 5. Dragon Boat Festival (端午节)
  {
    id: 'cn-dragonboat',
    title: 'Dragon Boat Festival (端午节)',
    start: new Date(2026, 5, 19), // Jun 19
    end: new Date(2026, 5, 21), // Jun 21
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'Dragon Boat Festival Holiday',
    priority: 2
  },

  // 6. Mid-Autumn Festival (中秋节)
  {
    id: 'cn-midautumn',
    title: 'Mid-Autumn Festival (中秋节)',
    start: new Date(2026, 8, 25), // Sep 25
    end: new Date(2026, 8, 27), // Sep 27
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'Mid-Autumn Festival Holiday',
    priority: 2
  },

  // 7. National Day (国庆节)
  {
      id: 'cn-national-work-1',
      title: 'Makeup Workday (National Day)',
      start: new Date(2026, 8, 20), // Sep 20 (Sun)
      allDay: true,
      category: 'CN',
      type: 'Other',
      description: 'Official Makeup Workday for National Day',
      priority: 1
  },
  {
    id: 'cn-national',
    title: 'National Day (国庆节)',
    start: new Date(2026, 9, 1), // Oct 1
    end: new Date(2026, 9, 7), // Oct 7
    allDay: true,
    category: 'CN',
    type: 'Holiday',
    description: 'National Day Golden Week',
    priority: 3
  },
  {
      id: 'cn-national-work-2',
      title: 'Makeup Workday (National Day)',
      start: new Date(2026, 9, 10), // Oct 10 (Sat)
      allDay: true,
      category: 'CN',
      type: 'Other',
      description: 'Official Makeup Workday for National Day',
      priority: 1
  }
];
