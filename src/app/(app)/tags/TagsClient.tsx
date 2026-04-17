"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Ticket,
} from "lucide-react";
import { createTag, deleteTag } from "@/lib/actions/tags";
import Link from "next/link";
import { useRouter } from "next/navigation";

const colorOptions = [
  "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#6366f1",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#dc2626",
];

export default function TagsClient({ initialTags }: { initialTags: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState(colorOptions[0]);
  const [tagName, setTagName] = React.useState("");
  const [tagDescription, setTagDescription] = React.useState("");

  const filteredTags = initialTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!tagName) return;
    setIsSubmitting(true);
    try {
      await createTag({ name: tagName, description: tagDescription, color: selectedColor });
      setCreateModalOpen(false);
      setTagName("");
      setTagDescription("");
      setSelectedColor(colorOptions[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to completely delete the tag "${name}" and remove it from all tickets?`)) {
      return;
    }
    try {
      await deleteTag(id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete tag.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <p className="text-zinc-400">
            Organize tickets with custom tags
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Tag
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search tags..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Total Tags</p>
            <p className="mt-1 text-3xl font-bold text-white">{initialTags.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Most Used</p>
            <div className="mt-1 flex items-center gap-2">
              {initialTags.length > 0 ? (
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: [...initialTags].sort((a,b) => b.ticketCount - a.ticketCount)[0].color }}
                >
                  {[...initialTags].sort((a,b) => b.ticketCount - a.ticketCount)[0].name}
                </span>
              ) : (
                <span className="text-zinc-500 text-sm">None yet</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Tagged Tickets</p>
            <p className="mt-1 text-3xl font-bold text-teal-400">
              {initialTags.reduce((acc, tag) => acc + (tag.ticketCount || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTags.map((tag) => (
          <Card key={tag.id} hover>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: tag.color + "20" }}
                  >
                    <Tag className="h-5 w-5" style={{ color: tag.color }} />
                  </div>
                  <div>
                    <Link href={`/tickets?tag=${encodeURIComponent(tag.name)}`}>
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-sm font-medium text-white hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    </Link>
                    <p className="mt-1 text-sm text-zinc-400">{tag.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Ticket className="h-4 w-4" />
                  <span>{tag.ticketCount} tickets</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-rose-400 hover:text-rose-300" onClick={() => handleDeleteTag(tag.id, tag.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} size="md">
        <ModalHeader onClose={() => setCreateModalOpen(false)}>
          Create New Tag
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Tag Name
              </label>
              <Input
                placeholder="e.g., priority-customer"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Description
              </label>
              <Input
                placeholder="What is this tag used for?"
                value={tagDescription}
                onChange={(e) => setTagDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-lg transition-transform ${
                      selectedColor === color
                        ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            {tagName && (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Preview
                </label>
                <span
                  className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: selectedColor }}
                >
                  {tagName || "tag-name"}
                </span>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTag} disabled={!tagName || isSubmitting} isLoading={isSubmitting}>
            <Tag className="h-4 w-4" />
            Create Tag
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

