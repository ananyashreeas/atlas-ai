"use client";

import { useState } from "react";

import NotesHeader from "@/components/NotesHeader";
import NoteCard from "@/components/NoteCard";

type Note = {
  id: number;
  title: string;
  content: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "Numerical Ability",
      content: "Practice percentages and averages.",
    },
    {
      id: 2,
      title: "Physics",
      content: "Revise AC Circuits and Network Theorems.",
    },
  ]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: `New Note ${notes.length + 1}`,
      content: "Start writing here...",
    };

    setNotes((prev) => [...prev, newNote]);
  };

  const deleteNote = (id: number) => {
    setNotes((prev) =>
      prev.filter((note) => note.id !== id)
    );
  };

  return (
    <div className="space-y-8">

      <NotesHeader onAddNote={addNote} />

      <div className="grid md:grid-cols-2 gap-6">

        {notes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            content={note.content}
            onDelete={() => deleteNote(note.id)}
          />
        ))}

      </div>

    </div>
  );
}