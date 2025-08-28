# React Data Table Editor (CRA + TypeScript)

This project is a spreadsheet-style **data table editor** built with **React, TypeScript, TailwindCSS, and Radix UI**.  
It demonstrates features such as **lazy loading, inline editing, and row management**.  

---

## 🚀 Features

- **Lazy loading (infinite scroll)** from a public JSON endpoint  
- **Inline cell editing**  
- **Add new row** (currently added at the top of the table)  
- **Toolbar with controls**:  
  - Filter (in progress)  
  - Sort  
  - Search  
  - Show/Hide fields  
  - Delete action  

---

## ✅ Implemented

- Lazy loading (infinite scroll)  
- Inline editing  
- Add new row (top insertion)  
- Toolbar with sort, search, filter (partial), field toggle, delete  

---

## ⏳ Not Yet Implemented

- Local caching of edits  
- Row placeholder at the **bottom of the table** (currently using “Add Row” button at the top)  
- Fully functional **filter logic**  

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**  
- **TailwindCSS** + **Radix UI** + **Lucide React**  
- **TanStack React Virtual** / **React Window** for virtualization  

---

## 📦 Installation

```bash
git clone https://github.com/vudung18110263/dangvudung-fe-test.git
cd dangvudung-fe-test
npm install
npm start
