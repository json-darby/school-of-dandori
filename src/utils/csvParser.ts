import { Course } from '../types';

/**
 * Fetches the list of courses from the backend API.
 * 
 * Retrieves course data including names, costs, instructors, locations,
 * and description details.
 * 
 * @returns A promise resolving to an array of course objects.
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://dandori-backend-274788224867.europe-west2.run.app');

export const getCourses = (): Promise<Course[]> => {
  return fetch(`${BACKEND_URL}/courses`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    })
    .then(data => data as Course[]);
};
