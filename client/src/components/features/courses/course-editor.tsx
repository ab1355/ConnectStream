import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import type { InsertCourse, InsertCourseSection, InsertCourseBlock } from "@shared/schema";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

// Define the schema here since we can't import it directly
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
});

interface CourseEditorProps {
  courseId?: number;
}

export function CourseEditor({ courseId }: CourseEditorProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState<Array<{
    id?: number;
    title: string;
    blocks: Array<{
      id?: number;
      type: string;
      content: string;
      metadata?: string;
    }>;
  }>>([]);

  const form = useForm<InsertCourse>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      coverImage: "",
      published: false,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course created",
        description: "Your course has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSection = () => {
    setSections([...sections, { title: "New Section", blocks: [] }]);
  };

  const handleAddBlock = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].blocks.push({
      type: "text",
      content: "",
    });
    setSections(newSections);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleRemoveBlock = (sectionIndex: number, blockIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].blocks = newSections[sectionIndex].blocks.filter(
      (_, i) => i !== blockIndex
    );
    setSections(newSections);
  };

  const onSubmit = async (data: InsertCourse) => {
    try {
      const course = await createCourseMutation.mutateAsync(data);

      // Create sections and blocks
      for (const section of sections) {
        const sectionData: InsertCourseSection = {
          courseId: course.id,
          title: section.title,
          order: sections.indexOf(section),
        };

        const res = await apiRequest("POST", "/api/course-sections", sectionData);
        const savedSection = await res.json();

        // Create blocks for this section
        for (const block of section.blocks) {
          const blockData: InsertCourseBlock = {
            sectionId: savedSection.id,
            type: block.type,
            content: block.content,
            order: section.blocks.indexOf(block),
            metadata: block.metadata,
          };

          await apiRequest("POST", "/api/course-blocks", blockData);
        }
      }
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course title" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter course description"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <FileUpload
                    accept="image/*"
                    onUploadComplete={(file) => {
                      field.onChange(file.url);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <Button type="button" onClick={handleAddSection}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[sectionIndex].title = e.target.value;
                      setSections(newSections);
                    }}
                    placeholder="Section title"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSection(sectionIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="pl-8 space-y-4">
                  {section.blocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="flex items-start gap-4">
                      <GripVertical className="w-4 h-4 mt-2 text-muted-foreground" />
                      <div className="flex-1">
                        <select
                          value={block.type}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].blocks[blockIndex].type =
                              e.target.value;
                            setSections(newSections);
                          }}
                          className="mb-2 w-32"
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="code">Code</option>
                          <option value="quiz">Quiz</option>
                        </select>
                        <Textarea
                          value={block.content}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].blocks[blockIndex].content =
                              e.target.value;
                            setSections(newSections);
                          }}
                          placeholder="Block content"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBlock(sectionIndex, blockIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddBlock(sectionIndex)}
                    className="ml-8"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Block
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={createCourseMutation.isPending}
            >
              {courseId ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}