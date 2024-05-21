"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MobxStore from "@/mobx";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ShieldAlert,
  Trash,
} from "lucide-react";

const Comparison = observer(
  ({ comparison, index, handleComparisonChange, handleRemoveComparison }) => {
    const [isCompOpen, setIsCompOpen] = useState(false);
    return (
      <div className="mb-4 p-4 border rounded-lg">
        <div className="flex gap-4 items-center ">
          <div className="text-4xl font-bold">{index + 1}</div>
          <div>
            <label className="block text-foreground">Comparison Anime</label>
            <Input
              type="text"
              name="anime"
              value={comparison.anime}
              onChange={(e) => handleComparisonChange(index, e)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-foreground">Comparison MAL ID</label>
            <Input
              type="text"
              name="malId"
              value={comparison.malId}
              onChange={(e) => handleComparisonChange(index, e)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <Button variant="outline" onClick={() => setIsCompOpen(!isCompOpen)}>
            {isCompOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>

          <Button
            variant="outline"
            className="text-red-400"
            onClick={() => handleRemoveComparison(index)}
          >
            <Trash />
          </Button>
        </div>
        {isCompOpen && (
          <div>
            <div className="mb-4">
              <label className="block text-foreground">Differences</label>
              <Textarea
                name="differences"
                value={comparison.differences}
                onChange={(e) => handleComparisonChange(index, e)}
                className="h-[200px] mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-foreground">Similarities</label>
              <Textarea
                name="similarities"
                value={comparison.similarities}
                onChange={(e) => handleComparisonChange(index, e)}
                className="h-[200px] mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

const CMSView = observer(() => {
  const [formData, setFormData] = useState(MobxStore.blog);

  useEffect(() => {
    MobxStore.fetchBlogs();
  }, []);

  useEffect(() => {
    setFormData(MobxStore.blog);
  }, [MobxStore.blog]);

  const handleChange = (e) => {
    MobxStore.updateBlogField(e.target.name, e.target.value);
  };

  const handleComparisonChange = (index, e) => {
    console.log({ index, e });
    MobxStore.updateComparison(index, e.target.name, e.target.value);
  };

  const handleAddComparison = () => {
    MobxStore.addComparison();
  };

  const handleRemoveComparison = (index) => {
    MobxStore.removeComparison(index);
  };

  const handleSubmit = () => {
    MobxStore.saveBlog(MobxStore.blog);
    MobxStore.resetBlog();
  };

  const handleEdit = (blog) => {
    MobxStore.setBlog(blog);
    MobxStore.setEditing(true);
  };

  const handleDelete = (id) => {
    MobxStore.deleteBlog(id);
  };

  const handleAddBlog = () => {
    MobxStore.resetBlog();
    MobxStore.setEditing(true);
  };

  return (
    <div className="p-4">
      {MobxStore.isEditing ? (
        <div>
          <div className="flex flex-col gap-2 mb-8">
            <Button
              variant="outline"
              className="w-[150px]"
              onClick={() => MobxStore.setEditing(false)}
            >
              <ChevronLeft /> Back
            </Button>
            <h1 className="text-2xl font-bold mb-4">
              Edit: <span className="text-md">{MobxStore.blog.anime}</span>
            </h1>
            <Button
              onClick={() => handleDelete(MobxStore.blog.id)}
              className="bg-red-500 hover:bg-red-700 w-fit"
            >
              <Trash /> Delete
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-foreground">Anime</label>
            <Input
              type="text"
              name="anime"
              value={formData.anime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-foreground">MAL ID</label>
            <Input
              type="text"
              name="malId"
              value={formData.malId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          {formData.comparisons?.map((comparison, index) => (
            <Comparison
              key={index}
              comparison={comparison}
              index={index}
              handleComparisonChange={handleComparisonChange}
              handleRemoveComparison={handleRemoveComparison}
            />
          ))}

          <Button
            onClick={() => handleAddComparison()}
            variant="outline"
            className="mr-2"
          >
            + Add Comparison
          </Button>
          <Button className="w-[150px]" onClick={() => handleSubmit()}>
            Save
          </Button>
        </div>
      ) : (
        <div>
          <div className="">
            <h2 className="text-4xl font-bold mb-4">
              Blogs ({MobxStore.blogs.length})
            </h2>
            <Button
              onClick={() => handleAddBlog()}
              className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              + Add Blog
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            {MobxStore.blogs.map((blog) => (
              <div
                key={blog.id}
                className="p-4 mb-4 border rounded-lg flex flex-col gap-3 w-[250px]"
              >
                <div className="text-2xl font-bold">{blog.anime}</div>
                <p className="font-bold text-sm">MAL ID: {blog.malId}</p>
                <div className="font-bold text-sm flex gap-2 items-center">
                  Comparisons: {blog.comparisons?.length} / 5{" "}
                  {blog.comparisons?.length < 5 && (
                    <ShieldAlert size={18} className="text-yellow-600" />
                  )}
                </div>
                {blog.comparisons?.map((comparison, index) => (
                  <div key={index}>
                    <p className="font-bold text-slate-500 text-sm">
                      - {comparison.anime} (MAL ID: {comparison.malId})
                    </p>
                  </div>
                ))}
                <Button onClick={() => handleEdit(blog)}>Edit</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default CMSView;
