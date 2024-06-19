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
  FileWarning,
  ShieldAlert,
  Trash,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/reusable-ui/ComboBox";

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
            {MobxStore.blog.type === "comparisons" ? (
              <>
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
              </>
            ) : (
              <div className="mb-4">
                <label className="block text-foreground">Content</label>
                <Textarea
                  name="content"
                  value={comparison.content}
                  onChange={(e) => handleComparisonChange(index, e)}
                  className="h-[200px] mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

const CMSView = observer(() => {
  const [formData, setFormData] = useState(MobxStore.blog);
  const [file, setFile] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState("");

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
    MobxStore.updateComparison(index, e.target.name, e.target.value);
  };

  const handleAddComparison = () => {
    MobxStore.addComparison();
  };

  const handleRemoveComparison = (index) => {
    MobxStore.removeComparison(index);
  };

  const handleSubmit = () => {
    MobxStore.saveBlog(MobxStore.blog, file);
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

  const handleTypeToggle = () => {
    const newType =
      MobxStore.blog.type === "comparisons" ? "list" : "comparisons";
    MobxStore.updateBlogField("type", newType);
    console.log("newType", newType);
    if (newType === "list") {
      console.log("newType", newType);
      MobxStore.updateBlogField("anime", "");
      MobxStore.updateBlogField("malId", "");
      MobxStore.blog.comparisons = MobxStore.blog.comparisons.map((comp) => ({
        ...comp,
        differences: "",
        similarities: "",
        content: comp.content || "",
      }));
    } else {
      console.log("newType", newType);
      MobxStore.updateBlogField("title", "");
    }
  };

  const isBlogTypeList = MobxStore.blog.type === "list";

  if (!isAdmin) {
    return (
      <div>
        <Input
          value={adminInput}
          type="text"
          onChange={(e) => setAdminInput(e.target.value)}
        />
        <Button onClick={() => setIsAdmin(adminInput === "pacipaci")}>
          Work In Progress
        </Button>
      </div>
    );
  }

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
              Edit:{" "}
              <span className="text-md">
                {MobxStore.blog.title || MobxStore.blog.anime}
              </span>
            </h1>
            <Button
              onClick={() => handleDelete(MobxStore.blog.id)}
              className="bg-red-500 hover:bg-red-700 w-fit"
            >
              <Trash /> Delete
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-foreground">Blog Type</label>
            <Switch
              checked={MobxStore.blog.type === "list"}
              onCheckedChange={handleTypeToggle}
              className="mt-1"
            >
              {MobxStore.blog.type === "list" ? "list" : "comparisons"}
            </Switch>
          </div>

          <>
            <div className="mb-4">
              <label className="block text-foreground">
                {isBlogTypeList ? "Title" : "Anime"}
              </label>
              <Input
                type="text"
                name={isBlogTypeList ? "title" : "anime"}
                value={isBlogTypeList ? formData.title : formData.anime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            {!isBlogTypeList && (
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
            )}
          </>

          <div>
            <label className="block text-foreground">Related Blog</label>
            <Combobox
              value={formData.related}
              setValue={(value) => {
                const find = MobxStore.blogs
                  .filter((b) => b.type == "list")
                  .filter((b) => {
                    return b.id.toLowerCase() == value;
                  });

                MobxStore.updateBlogField("related", find[0].id);
              }}
              searchLabel={"Search Blog"}
              options={MobxStore.blogs
                .filter((b) => b.type == "list")
                .map((blog) => {
                  return { label: blog.title, value: blog.id };
                })}
            />
          </div>

          <div className="mb-4">
            {formData.image && (
              <Image src={formData.image} width={250} height={250} alt="img" />
            )}
            <label className="block text-foreground">Upload Image</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
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
          <Tabs defaultValue="lists">
            <TabsList>
              <TabsTrigger value="lists">Top Lists</TabsTrigger>
              <TabsTrigger value="comparisons">Comparisons (GPT)</TabsTrigger>
            </TabsList>
            <TabsContent value="lists">
              <div className="flex flex-wrap gap-4">
                {MobxStore.blogs
                  .filter((b) => b.type == "list")
                  .map((blog) => (
                    <div
                      key={blog.id}
                      className="p-4 mb-4 border rounded-lg flex flex-col gap-3 w-[250px]"
                    >
                      {blog.image && (
                        <Image
                          src={blog.image}
                          width={250}
                          height={250}
                          alt="img"
                        />
                      )}
                      <div className="text-2xl font-bold">
                        {blog.title || blog.anime}
                      </div>
                      <p className="font-bold text-sm">ID: {blog.id}</p>
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
            </TabsContent>
            <TabsContent value="comparisons" className="w-full">
              <div className="flex flex-wrap gap-4">
                {MobxStore.blogs
                  .filter((b) => b.type !== "list")
                  .map((blog) => (
                    <div
                      key={blog.id}
                      className="p-4 mb-4 border rounded-lg flex flex-col gap-3 w-[250px]"
                    >
                      {blog.image && (
                        <Image
                          src={blog.image}
                          width={250}
                          height={250}
                          alt="img"
                        />
                      )}
                      <div className="text-2xl font-bold">
                        {blog.title || blog.anime}
                      </div>
                      <p className="font-bold text-sm">
                        Related:{" "}
                        {
                          MobxStore.blogs.filter((b) => b.id == blog.related)[0]
                            ?.title
                        }{" "}
                        {/* {blog.related}  */}- {!blog.related ? "❌" : "✅"}
                      </p>
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
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
});

export default CMSView;
