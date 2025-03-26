"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { AskQuestionSchema } from "@/lib/validation";
import { z } from "zod";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import TagCard from "../cards/TagCard";
import { useRouter } from "next/navigation";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { toast } from "sonner";
import ROUTES from "@/constants/routes";
import { ReloadIcon } from "@radix-ui/react-icons";
const Editor = dynamic(() => import("@/components/Editor/index"), { ssr: false });

interface Params {
  question?: Question;
  isEdit?: boolean;
}

const QuestionForm = ({ question, isEdit }: Params) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, value: string[]) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();

      const tagValue = e.currentTarget.value.trim().toLowerCase();

      // Check if tag already exists in the provided value array
      if (value.includes(tagValue)) {
        form.setError("tags", {
          type: "manual",
          message: "This tag already exists. Please try another one."
        });
        return;
      }
      // Check if tag is more than 15 characters
      if (tagValue.length > 15) {
        form.setError("tags", {
          type: "manual",
          message: "Tag must be less than 15 characters."
        });
        return;
      }

      // Add the tag to existing tags
      form.setValue("tags", [...value, tagValue]);

      // Clear any previous error and input
      form.clearErrors("tags");
      e.currentTarget.value = '';
    }
  };
  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });
  const editorRef = useRef<MDXEditorMethods>(null);

  const handleCreateQuestion = async (data: z.infer<typeof AskQuestionSchema>) => {

    startTransition(async () => {
      if (isEdit && question) {
        const result = await editQuestion({ questionId: question?._id, ...data });/* Updating the edited question by spreading the data. */
        if (result.success) {
          toast.success("Question updated successfully");
          if (result.data) router.push(ROUTES.QUESTION(result.data._id));
        } else {
          toast.error(result.error?.message || "Something went wrong");
        }
      } else {
        const result = await createQuestion(data);
        if (result.success) {
          toast.success("Question created successfully");
          if (result.data) router.push(ROUTES.QUESTION(result.data._id));
        } else {
          toast.error(result.error?.message || "Something went wrong");
        }
      }
    });
  };
  const handleTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag);
    form.setValue("tags", newTags);

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "At least one tag is required."
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleCreateQuestion)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Be specific and imagine you&apos;re asking a question to another
                person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Detailed explanation of your problem{" "}
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div suppressHydrationWarning>
                  <Editor value={field.value} fieldChange={field.onChange} editorRef={editorRef} />
                </div>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Introduce the problem and expand on what you&apos;ve put in the
                title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input onKeyDown={(e) => handleInputKeyDown(e, field.value)}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                    placeholder="Add tags..."
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5 " > {field?.value?.map((tag: string) => <TagCard
                      key={tag}
                      _id={tag}
                      name={tag}
                      compact remove isButton handleRemove={(e) => handleTagRemove(tag, field)}
                    />)} </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Add up to 3 tags to describe what your question is about. You
                need to press enter to add a tag.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-16 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="primary-gradient w-fit !text-light-900"
          >
            {isPending ? (<>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Asking...
            </>) : (<>
              {isEdit ? "Edit" : "Ask A Question"}
            </>)}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;