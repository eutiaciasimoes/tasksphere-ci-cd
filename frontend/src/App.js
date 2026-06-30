import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // SORT
  const [sort, setSort] = useState("none");

  // MESSAGES
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error

  // EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // FILTER + SEARCH
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // SHOW MESSAGE FUNCTION (improved)
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // FETCH TASKS
  const fetchTasks = () => {
    fetch("http://localhost:8000/api/tasks/")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // CREATE TASK
  const handleCreateTask = async (e) => {
    e.preventDefault();

    const newTask = { title, description };

    const response = await fetch("http://localhost:8000/api/tasks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    if (response.ok) {
      setTitle("");
      setDescription("");
      fetchTasks();
      showMessage("Task created successfully!", "success");
    } else {
      showMessage("Failed to create task.", "error");
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (id) => {
    const response = await fetch(`http://localhost:8000/api/tasks/${id}/`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchTasks();
      showMessage("Task deleted.", "success");
    } else {
      showMessage("Failed to delete task.", "error");
    }
  };

  // UPDATE TASK
  const handleUpdateTask = async (id) => {
    const updatedTask = {
      title: editTitle,
      description: editDescription,
    };

    const response = await fetch(`http://localhost:8000/api/tasks/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      setEditingId(null);
      fetchTasks();
      showMessage("Task updated.", "success");
    } else {
      showMessage("Failed to update task.", "error");
    }
  };

  // TOGGLE COMPLETE
  const handleToggleComplete = async (task) => {
    const updatedTask = {
      title: task.title,
      description: task.description,
      completed: !task.completed,
    };

    const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      fetchTasks();
      showMessage("Task updated.", "success");
    } else {
      showMessage("Failed to update task.", "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task List</h1>

      {/* MESSAGE BOX (bright + visible) */}
      {message && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: messageType === "success" ? "#d4ffd4" : "#ffd4d4",
            color: messageType === "success" ? "#006400" : "#8b0000",
            border: `2px solid ${messageType === "success" ? "#006400" : "#8b0000"}`,
            borderRadius: "6px",
            fontWeight: "bold",
            width: "350px",
            fontSize: "16px",
          }}
        >
          {message}
        </div>
      )}

      {tasks.length === 0 && <p>No tasks yet.</p>}

      {/* CREATE TASK FORM */}
      <form onSubmit={handleCreateTask} style={{ marginBottom: "20px" }}>
        <h2>Create a Task</h2>

        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "300px" }}
        />

        <button type="submit">Add Task</button>
      </form>

      {/* FILTER BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")} style={{ marginLeft: "10px" }}>
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{ marginLeft: "10px" }}
        >
          Completed
        </button>
      </div>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "300px",
          display: "block",
        }}
      />

      {/* SORT BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setSort("az")}>A → Z</button>
        <button onClick={() => setSort("za")} style={{ marginLeft: "10px" }}>
          Z → A
        </button>
        <button onClick={() => setSort("newest")} style={{ marginLeft: "10px" }}>
          Newest
        </button>
        <button onClick={() => setSort("oldest")} style={{ marginLeft: "10px" }}>
          Oldest
        </button>
      </div>

      {/* TASK LIST */}
      <ul>
        {tasks
          .filter((task) => {
            if (filter === "active") return !task.completed;
            if (filter === "completed") return task.completed;
            return true;
          })
          .filter((task) => {
            const text = search.toLowerCase();
            return (
              task.title.toLowerCase().includes(text) ||
              task.description.toLowerCase().includes(text)
            );
          })
          .sort((a, b) => {
            if (sort === "az") return a.title.localeCompare(b.title);
            if (sort === "za") return b.title.localeCompare(a.title);
            if (sort === "newest") return b.id - a.id;
            if (sort === "oldest") return a.id - b.id;
            return 0;
          })
          .map((task) => (
           <li
  key={task.id}
  style={{
    backgroundColor: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }}
>

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
                style={{ marginRight: "10px" }}
              />

              {editingId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  <button onClick={() => handleUpdateTask(task.id)}>Save</button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{ marginLeft: "10px" }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    <strong>{task.title}</strong> - {task.description}
                  </span>

                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                      setEditDescription(task.description);
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{ marginLeft: "10px", color: "red" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
