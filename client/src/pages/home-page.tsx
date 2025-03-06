import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Task, Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, CheckSquare2, Users } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const pendingTasks = tasks?.filter(task => task.status === "pending") || [];
  const ongoingCourses = courses?.filter(course => !course.completed) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Welcome, {user?.displayName || user?.username}!</h1>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/courses/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Course
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/tasks">
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare2 className="w-5 h-5" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className="text-sm text-muted-foreground">pending tasks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{ongoingCourses.length}</p>
                  <p className="text-sm text-muted-foreground">ongoing courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Spaces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">active spaces</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {pendingTasks.slice(0, 5).map(task => (
                        <li key={task.id} className="flex items-center justify-between">
                          <span>{task.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No pending tasks</p>
                  )}
                  <Button variant="link" asChild className="mt-4 px-0">
                    <Link href="/tasks">View all tasks</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ongoing Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  {ongoingCourses.length > 0 ? (
                    <ul className="space-y-2">
                      {ongoingCourses.slice(0, 5).map(course => (
                        <li key={course.id} className="flex items-center justify-between">
                          <span>{course.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No ongoing courses</p>
                  )}
                  <Button variant="link" asChild className="mt-4 px-0">
                    <Link href="/courses">View all courses</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}