
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TagService } from "@/services/tag-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Tag, Pencil, Trash, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TagForm } from "@/components/tags/TagForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Tags() {
  const { data: tags, isLoading, error, refetch } = useQuery({
    queryKey: ['tags'],
    queryFn: TagService.getAllTags,
  });

  const handleTagAdded = () => {
    refetch();
  };

  const getTagColorBadge = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      cyan: "bg-cyan-500",
      orange: "bg-orange-500",
      teal: "bg-teal-500",
    };

    const bgClass = colorMap[color] || "bg-gray-500";
    return <div className={`w-6 h-6 rounded-full ${bgClass}`}></div>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Tags</h1>
          <p className="text-muted-foreground">Create and manage tags for categorizing products</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Tag</SheetTitle>
            </SheetHeader>
            <TagForm onTagAdded={handleTagAdded} />
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tag List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-8">
              Failed to load tags
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags && tags.length > 0 ? (
                    tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{tag.name}</div>
                              {tag.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {tag.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tag.color ? (
                            <div className="flex items-center gap-2">
                              {getTagColorBadge(tag.color)}
                              <span className="capitalize">{tag.color}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Default</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{tag.productCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(tag.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        <div className="flex flex-col items-center py-8">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Tag className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p>No tags found</p>
                          <p className="text-sm text-muted-foreground mt-1">Create your first tag to categorize products</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
