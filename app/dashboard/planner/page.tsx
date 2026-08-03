"use client";

import { useState } from "react";

export default function PlannerPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Numerical Ability", completed: true },
    { id: 2, title: "Mental Ability", completed: false },
    { id: 3, title: "Physics Revision", completed: false },
    { id: 4, title: "Mock Test", completed: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const progress = (completedTasks / tasks.length) * 100;

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          📅 Study Planner
        </h1>

        <p className="text-slate-400 mt-2">
          Stay consistent. Small progress every day.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">

        <div className="flex justify-between mb-4">

          <h2 className="text-2xl font-bold">
            Today's Progress
          </h2>

          <span className="text-yellow-400 font-semibold">
            {Math.round(progress)}%
          </span>

        </div>

        <div className="w-full bg-slate-800 rounded-full h-4">
          <div
            className="bg-yellow-400 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">

        <h2 className="text-2xl font-bold mb-6">
          Today's Tasks
        </h2>

        <div className="space-y-4">

          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-center gap-4 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-5 h-5"
              />

              <span
                className={
                  task.completed
                    ? "line-through text-slate-500"
                    : ""
                }
              >
                {task.title}
              </span>

            </label>
          ))}

        </div>

      </div>

    </div>
  );
}