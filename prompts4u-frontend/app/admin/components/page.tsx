"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageGuard } from "@/components/admin/admin-page-guard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { COMPONENT_CATEGORIES, COMPONENT_TIERS, formatCategory } from "@/config/admin";
import { Layers, Plus, Search, Eye, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface Component {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  promptContent: string;
  previewImageUrl?: string;
  previewCode?: string;
  tags: string[];
  copyCount: number;
  createdAt: string;
}

interface NewComponentState {
  name: string;
  description: string;
  category: string;
  tier: string;
  promptContent: string;
  tags: string;
}

export default function AdminComponentsPage() {
  const router = useRouter();
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newComponent, setNewComponent] = useState<NewComponentState>({
    name: "",
    description: "",
    category: "",
    tier: "free",
    promptContent: "",
    tags: "",
  });

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await apiClient.get<{ data: Component[] }>("/components");
      setComponents(response.data.data);
    } catch (error) {
      console.error("Failed to fetch components:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComponent = async () => {
    try {
      await apiClient.post("/admin/components", {
        ...newComponent,
        tags: newComponent.tags.split(",").map((t) => t.trim()),
      });

      toast.success("Component created successfully");
      setIsCreateDialogOpen(false);
      fetchComponents();
      setNewComponent({
        name: "",
        description: "",
        category: "",
        tier: "free",
        promptContent: "",
        tags: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create component");
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this component?")) return;

    try {
      await apiClient.delete(`/admin/components/${id}`);
      toast.success("Component deleted successfully");
      fetchComponents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete component");
    }
  };

  const handleCopyPrompt = (promptContent: string) => {
    navigator.clipboard.writeText(promptContent);
    toast.success("Prompt copied to clipboard");
  };

  const filteredComponents = components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (component: Component) => (
        <div>
          <p className="font-medium">{component.name}</p>
          <p className="text-sm text-muted-foreground">{component.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (component: Component) => (
        <Badge variant="outline">{component.category}</Badge>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      cell: (component: Component) => (
        <Badge variant={component.tier === "pro" ? "default" : "secondary"}>
          {component.tier}
        </Badge>
      ),
    },
    { key: "copyCount", header: "Copies" },
    {
      key: "tags",
      header: "Tags",
      cell: (component: Component) => (
        <div className="flex gap-1 flex-wrap">
          {component.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {component.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{component.tags.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (component: Component) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/marketplace?component=${component.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCopyPrompt(component.promptContent)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteComponent(component.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <AdminPageGuard redirectLogin="/admin/components">
      <div className="container min-h-screen mx-auto px-4 py-8">
        <AdminPageHeader
          icon={Layers}
          title="Manage Components"
          description="Create, view, and manage prompt components"
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Component
            </Button>
          }
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Components</CardTitle>
            <CardDescription>
              Manage your prompt components across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <AdminSearchBar
                placeholder="Search components..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-1"
              />
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value || "")}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {COMPONENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {formatCategory(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AdminDataTable
              data={filteredComponents}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No components found"
            />
          </CardContent>
        </Card>

        <CreateComponentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          component={newComponent}
          setComponent={setNewComponent}
          onCreate={handleCreateComponent}
        />
      </div>
    </AdminPageGuard>
  );
}

interface CreateComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: NewComponentState;
  setComponent: React.Dispatch<React.SetStateAction<NewComponentState>>;
  onCreate: () => void;
}

function CreateComponentDialog({
  open,
  onOpenChange,
  component,
  setComponent,
  onCreate,
}: CreateComponentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
          <DialogDescription>
            Add a new prompt component to the marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g., Modern Hero Section"
              value={component.name}
              onChange={(e) => setComponent({ ...component, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Brief description of the component"
              value={component.description}
              onChange={(e) =>
                setComponent({ ...component, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={component.category}
                onValueChange={(value) =>
                  setComponent({ ...component, category: value || "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div className="grid gap-2">
              <label className="text-sm font-medium">Tier</label>
              <Select
                value={component.tier}
                onValueChange={(value) =>
                  setComponent({ ...component, tier: value || "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENT_TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {formatCategory(tier)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Prompt Content</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter the AI prompt for generating this component..."
              value={component.promptContent}
              onChange={(e) =>
                setComponent({ ...component, promptContent: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <Input
              placeholder="modern, clean, responsive"
              value={component.tags}
              onChange={(e) =>
                setComponent({ ...component, tags: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate}>Create Component</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
