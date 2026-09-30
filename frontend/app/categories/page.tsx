"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { api } from "@/lib/api";
import type { Lookup } from "@/types/task";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Lookup[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.categories();
        setCategories(res.items);
      } catch {
        setCategories([
          { id: "cat-work", name: "Work", color: "#6366F1" },
          { id: "cat-study", name: "Study", color: "#10B981" },
          { id: "cat-marketing", name: "Marketing", color: "#EC4899" },
          { id: "cat-operations", name: "Operations", color: "#0EA5E9" },
          { id: "cat-admissions", name: "Admissions", color: "#8B5CF6" },
          { id: "cat-personal", name: "Personal", color: "#F59E0B" },
        ]);
      }
    }
    void loadData();
  }, []);

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        counts={{ total: 10, today: 3, upcoming: 4, completed: 3, overdue: 1 }}
        completionRate={30}
      />

      <div className="main-wrapper">
        <Topbar breadcrumbTitle="Task Categories" />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag">ORGANIZATION</div>
              <h1 className="hero-title">Task Categories</h1>
              <p className="hero-desc">Manage categories and tags to organize tasks across departments.</p>
            </div>
          </div>

          <CategoryManager
            categories={categories}
            taskCountsByCategory={{ Work: 4, Marketing: 2, Operations: 2, Admissions: 1, Personal: 1 }}
            onAddCategory={cat => setCategories(prev => [...prev, { id: "cat-" + Date.now(), ...cat }])}
            onDeleteCategory={id => setCategories(prev => prev.filter(c => c.id !== id))}
          />
        </main>
      </div>
    </div>
  );
}
