import { useState, useMemo, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useAi } from "@/context/AiContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Sparkles, Tag } from "lucide-react";

export type Note = {
  id: string;
  title: string;
  content: string;
  label?: string;
  color: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
};

const noteColors = [
  { name: "Yellow", value: "bg-yellow-100 border-yellow-300", text: "text-yellow-800" },
  { name: "Blue", value: "bg-blue-100 border-blue-300", text: "text-blue-800" },
  { name: "Green", value: "bg-green-100 border-green-300", text: "text-green-800" },
  { name: "Pink", value: "bg-pink-100 border-pink-300", text: "text-pink-800" },
  { name: "Purple", value: "bg-purple-100 border-purple-300", text: "text-purple-800" },
  { name: "Orange", value: "bg-orange-100 border-orange-300", text: "text-orange-800" },
];

export default function NotesPage() {
  const { businesses, selectedBusinessId, notes, addNote, updateNote, deleteNote } = useData();
  const { ask, isLoading } = useAi();
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showRefineDialog, setShowRefineDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [refinedContent, setRefinedContent] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    content: "",
    label: "",
    color: noteColors[0].value,
  });

  useEffect(() => {
    document.title = "Notes - MultiBiz";
  }, []);

  const currentBusiness = businesses.find(b => b.id === selectedBusinessId);
  const businessNotes = notes?.filter(n => n.businessId === selectedBusinessId) || [];

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      label: "",
      color: noteColors[0].value,
    });
    setEditingNote(null);
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      label: note.label || "",
      color: note.color,
    });
    setShowDialog(true);
  };

  const onSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;

    const noteData = {
      title: form.title.trim(),
      content: form.content.trim(),
      label: form.label.trim() || undefined,
      color: form.color,
      businessId: selectedBusinessId!,
    };

    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      addNote(noteData);
    }

    resetForm();
    setShowDialog(false);
  };

  const handleRefineNote = async (note: Note) => {
    setSelectedNote(note);
    setShowRefineDialog(true);
    
    try {
      const prompt = `Please refine and improve the following note while keeping its core meaning. Make it clearer, better structured, and more professional:

Title: ${note.title}
Content: ${note.content}

Please provide only the improved content without any additional explanation.`;
      
      await ask(prompt);
      // The refined content will be available in the AI context messages
    } catch (error) {
      console.error("Failed to refine note:", error);
    }
  };

  const applyRefinedContent = () => {
    if (selectedNote && refinedContent) {
      updateNote(selectedNote.id, {
        ...selectedNote,
        content: refinedContent,
        updatedAt: new Date().toISOString(),
      });
      setShowRefineDialog(false);
      setSelectedNote(null);
      setRefinedContent("");
    }
  };

  const getColorClasses = (colorValue: string) => {
    const color = noteColors.find(c => c.value === colorValue);
    return color || noteColors[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            {currentBusiness?.name} • {businessNotes.length} note{businessNotes.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
              <DialogDescription>
                Create a new note with a title, content, optional label, and color.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your note content here..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g., Meeting, Idea, Todo..."
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={form.color} onValueChange={(value) => setForm({ ...form, color: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {noteColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${color.value}`} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={onSubmit} disabled={!form.title.trim() || !form.content.trim()}>
                  {editingNote ? "Update Note" : "Add Note"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {businessNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <p>No notes yet.</p>
              <p className="text-sm">Click "Add Note" to create your first note.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businessNotes.map((note) => {
            const colorClasses = getColorClasses(note.color);
            return (
              <Card key={note.id} className={`${colorClasses.value} transition-all hover:shadow-md`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className={`text-lg ${colorClasses.text}`}>
                      {note.title}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefineNote(note)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(note)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {note.label && (
                    <Badge variant="secondary" className="w-fit">
                      <Tag className="mr-1 h-3 w-3" />
                      {note.label}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className={`text-sm whitespace-pre-wrap ${colorClasses.text} opacity-90`}>
                    {note.content}
                  </p>
                  <div className="mt-3 text-xs opacity-60">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2">
                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Refine Dialog */}
      <Dialog open={showRefineDialog} onOpenChange={setShowRefineDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI Note Refinement</DialogTitle>
            <DialogDescription>
              AI is refining your note to make it clearer and more professional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedNote && (
              <div>
                <Label>Original Note:</Label>
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium">{selectedNote.title}</h4>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedNote.content}</p>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="refined">Refined Content:</Label>
              <Textarea
                id="refined"
                value={refinedContent}
                onChange={(e) => setRefinedContent(e.target.value)}
                placeholder="AI refined content will appear here..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRefineDialog(false)}>
                Cancel
              </Button>
              <Button onClick={applyRefinedContent} disabled={!refinedContent.trim()}>
                Apply Refinement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}