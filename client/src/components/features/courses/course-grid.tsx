import { CourseCard } from "./course-card";

// Sample data - this would typically come from an API
const courses = [
  {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
    category: "Programming",
    level: "Beginner",
    duration: "8 weeks",
    enrolledCount: 1234,
    progress: 75,
    imageUrl: "https://picsum.photos/seed/course1/800/400"
  },
  {
    title: "UI/UX Design Principles",
    description: "Master the principles of user interface and user experience design.",
    category: "Design",
    level: "Intermediate",
    duration: "6 weeks",
    enrolledCount: 856,
    imageUrl: "https://picsum.photos/seed/course2/800/400"
  },
  {
    title: "Advanced React Patterns",
    description: "Deep dive into advanced React patterns and best practices.",
    category: "Programming",
    level: "Advanced",
    duration: "10 weeks",
    enrolledCount: 567,
    progress: 25,
    imageUrl: "https://picsum.photos/seed/course3/800/400"
  }
];

export function CourseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <CourseCard key={index} {...course} />
      ))}
    </div>
  );
}
