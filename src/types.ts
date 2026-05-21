/**
 * Represents the structure of a Course.
 * 
 * Defines all standard attributes of a Dandori course, including details
 * about the instructor, type, location, learning objectives, and cost.
 */
export interface Course {
  ID: string;
  "Course Name": string;
  Instructor: string;
  "Course Type": string;
  Location: string;
  Cost: string;
  "Learning Objectives": string;
  "Provided Materials": string;
  "Skills Developed": string;
  Description: string;
}
