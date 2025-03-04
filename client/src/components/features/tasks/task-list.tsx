import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, insertTaskSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckCircle2, Circle, Plus } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function TaskList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const addTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertTaskSchema>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      form.reset();
      setShowAddTask(false);
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingScreen variant="inline" message="Loading tasks..." />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddTask(!showAddTask)}
            variant={showAddTask ? "secondary" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
        <CardDescription>
          Manage your personal tasks and to-dos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showAddTask && (
          <form
            onSubmit={form.handleSubmit((data) => addTaskMutation.mutate(data))}
            className="space-y-4 mb-6"
          >
            <Input
              placeholder="Task title"
              {...form.register("title")}
            />
            <Textarea
              placeholder="Description (optional)"
              {...form.register("description")}
            />
            <div className="flex gap-4">
              <Select
                onValueChange={(value) => form.setValue("priority", value)}
                defaultValue={form.getValues("priority")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("dueDate") ? (
                      format(new Date(form.watch("dueDate")), "PPP")
                    ) : (
                      <span>Pick a due date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("dueDate")}
                    onSelect={(date) => form.setValue("dueDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addTaskMutation.isPending}
              >
                Add Task
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {tasks?.map((task: Task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border",
                task.status === "completed" && "bg-muted"
              )}
            >
              <button
                onClick={() =>
                  toggleTaskStatus.mutate({
                    id: task.id,
                    status: task.status === "completed" ? "pending" : "completed",
                  })
                }
                className="mt-1"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "font-medium",
                    task.status === "completed" && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      task.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    )}
                  >
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(task.dueDate), "PP")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}