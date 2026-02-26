"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("PENDING");

  const fetchTasks = async () => {
    const res = await fetch(
      `/api/tasks?page=${page}&search=${search}&status=${statusFilter}`
    );
    const data = await res.json();
    setTasks(data.data);
    setPagination(data.pagination);
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, statusFilter]);

  const createTask = async () => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    setTitle("");
    setDescription("");
    setPage(1);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        status: editStatus,
      }),
    });

    setEditingId(null);
    fetchTasks();
  };

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Create Task */}
      <div className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="bg-black text-white p-2"
          onClick={createTask}
        >
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          className="border p-2"
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border p-4 flex justify-between"
          >
            {editingId === task.id ? (
              <div className="flex flex-col gap-2 w-full">
                <input
                  className="border p-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  className="border p-2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <select
                  className="border p-2"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>

                <div className="flex gap-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1"
                    onClick={() => saveEdit(task.id)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-400 text-white px-3 py-1"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-bold">{task.title}</h2>
                  <p>{task.description}</p>
                  <p className="text-sm text-gray-500">
                    {task.status}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="text-blue-600"
                    onClick={() => startEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}