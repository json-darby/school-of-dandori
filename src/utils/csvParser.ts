import { Course } from '../types';

export const getCourses = (): Promise<Course[]> => {
  return fetch('https://school-of-dandori-980659832082.europe-west2.run.app/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    })
    .then(data => data as Course[]);
};
