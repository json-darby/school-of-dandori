import { Course } from '../types';

export const getCourses = (): Promise<Course[]> => {
  return fetch('http://localhost:3001/courses')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    })
    .then(data => data as Course[]);
};
