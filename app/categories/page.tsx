"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { toast } from "@/components/ui/Toast";
import {
  loadStoredCategories,
  saveStoredCategories,
  loadStoredTasks,
  calculateSummary,
} from "@/lib/store";
import type { Lookup } from "@/types/task";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  useEffect(() => {
    setCategories(loadStoredCategories());
  }, []);

  const tasks = typeof window !== "undefined" ? loadStoredTasks() : [];
  const summary = calculateSummary(tasks);

  function handleAddCategory(cat: { name: string; color: string }) {
    const updated = [...categories, { id: "cat-" + Date.now(), ...cat }];
    setCategories(updated);
    saveStoredCategories(updated);
    toast.success("Category Created", `'${cat.name}' has been created`);
  }

  function handleDeleteCategory(id: string) {
    const found = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveStoredCategories(updated);
    toast.info("Category Deleted", found ? `'${found.name}' removed` : "Category removed");
  }

  const taskCounts: Record<string, number> = {};
  tasks.forEach(t => {
    taskCounts[t.category] = (taskCounts[t.category] || 0) + 1;
  });

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        counts={{
          total: tasks.length,
          today: tasks.filter(t => t.dueDate === new Date().toISOString().slice(0, 10)).length,
          upcoming: tasks.filter(t => t.dueDate && t.dueDate > new Date().toISOString().slice(0, 10)).length,
          completed: summary.completed,
          overdue: summary.overdue,
        }}
        completionRate={summary.completionRate}
        brandName="EasyMyLearning"
      />

      <div className="main-wrapper">
        <Topbar
          breadcrumbTitle="Task Categories"
          onHelpClick={() => setShortcutsModalOpen(true)}
        />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag" style={{ color: "#FFAA00" }}>ORGANIZATION &amp; TAXONOMY (PDF PAGE 5 &amp; 6)</div>
              <h1 className="hero-title">Task Categories</h1>
              <p className="hero-desc">
                Configurable task categories: Work, Study, Admissions, Finance, Marketing, Operations, Personal.
              </p>
            </div>
          </div>

          <CategoryManager
            categories={categories}
            taskCountsByCategory={taskCounts}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </main>
      </div>

      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}
