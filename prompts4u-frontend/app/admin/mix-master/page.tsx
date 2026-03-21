"use client";

import { useEffect, useState } from "react";
import { AdminPageGuard } from "@/components/admin/admin-page-guard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import {
  COMPONENT_CATEGORIES,
  formatCategory,
  PROMPT_STATUS,
} from "@/config/admin";
import { Blend, Sparkles, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Prompt {
  id: string;
  title?: string;
  promptText: string;
  componentType: string;
  category?: string;
  upvotes: number;
  copyCount: number;
  status: string;
  publishedAt?: string;
}

export default function AdminMixMasterPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchPrompts(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchPrompts = async (category: string) => {
    try {
      const response = await apiClient.get<Prompt[]>(
        `/admin/mix-master/prompts/${category}`
      );
      setAvailablePrompts(response.data);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMix = async () => {
    if (selectedPromptIds.length < 2) {
      toast.error("Please select at least 2 prompts to mix");
      return;
    }

    setIsCreating(true);
    try {
      await apiClient.post("/admin/mix-master", {
        category: selectedCategory,
        sourcePromptIds: selectedPromptIds,
      });

      toast.success("Mix Master created successfully!");
      setIsDialogOpen(false);
      setSelectedPromptIds([]);
      fetchPrompts(selectedCategory);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create mix");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AdminPageGuard redirectLogin="/admin/mix-master">
      <div className="container min-h-screen mx-auto px-4 py-8">
        <AdminPageHeader
          icon={Blend}
          title="Mix Master"
          description="Synthesize multiple prompts into superior combinations"
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {formatCategory(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">How Mix Master Works</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Select a component category</li>
                  <li>Choose 2+ published prompts</li>
                  <li>AI synthesizes the best elements</li>
                  <li>Get a superior combined prompt</li>
                  <li>New prompt is auto-published</li>
                </ol>
              </CardContent>
            </Card>

            {selectedCategory && (
              <Button
                className="w-full gap-2"
                onClick={() => setIsDialogOpen(true)}
                disabled={selectedPromptIds.length < 2}
              >
                <Sparkles className="h-4 w-4" />
                Create Mix ({selectedPromptIds.length}/2+)
              </Button>
            )}
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Available Prompts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedCategory
                    ? `Select prompts from ${selectedCategory} category to mix`
                    : "Select a category to view prompts"}
                </p>

                {!selectedCategory ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a category to begin
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading prompts...
                  </div>
                ) : availablePrompts.length > 0 ? (
                  <div className="grid gap-3">
                    {availablePrompts.map((prompt) => (
                      <Card
                        key={prompt.id}
                        className={`cursor-pointer transition-all ${
                          selectedPromptIds.includes(prompt.id)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedPromptIds((prev) =>
                            prev.includes(prompt.id)
                              ? prev.filter((id) => id !== prompt.id)
                              : [...prev, prompt.id]
                          );
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedPromptIds.includes(prompt.id)}
                              onCheckedChange={() => {}}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">
                                  {prompt.title || "Untitled Prompt"}
                                </p>
                                <div className="flex gap-2">
                                  <Badge variant="outline">
                                    {prompt.componentType}
                                  </Badge>
                                  {prompt.status === PROMPT_STATUS.PUBLISHED && (
                                    <Badge className="bg-green-500 gap-1">
                                      <Check className="h-3 w-3" />
                                      Published
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {prompt.promptText}
                              </p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>Upvotes: {prompt.upvotes}</span>
                                <span>Copies: {prompt.copyCount}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No published prompts found in this category.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <MixDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedCategory={selectedCategory}
          selectedPromptIds={selectedPromptIds}
          availablePrompts={availablePrompts}
          isCreating={isCreating}
          onCreate={handleCreateMix}
        />
      </div>
    </AdminPageGuard>
  );
}

interface MixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  selectedPromptIds: string[];
  availablePrompts: Prompt[];
  isCreating: boolean;
  onCreate: () => void;
}

function MixDialog({
  open,
  onOpenChange,
  selectedCategory,
  selectedPromptIds,
  availablePrompts,
  isCreating,
  onCreate,
}: MixDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Mix Master</DialogTitle>
          <DialogDescription>
            Synthesize {selectedPromptIds.length} prompts into one superior
            prompt for the {formatCategory(selectedCategory)} category.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-2">Selected prompts:</p>
          <ul className="space-y-1">
            {selectedPromptIds.map((id) => {
              const prompt = availablePrompts.find((p) => p.id === id);
              return (
                <li key={id} className="text-sm text-muted-foreground">
                  • {prompt?.title || "Untitled Prompt"}
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Mix
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
