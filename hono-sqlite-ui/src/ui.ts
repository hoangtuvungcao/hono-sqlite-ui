export function getHtmlTemplate(basePath: string): string {
  // Strip trailing slash if present
  const cleanedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SQLite Admin Dashboard</title>
  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['Fira Code', 'monospace'],
          },
          colors: {
            brand: {
              50: '#f4f5fa',
              100: '#eae9f5',
              200: '#d7d4ee',
              300: '#bab2e2',
              400: '#9b8bd2',
              500: '#7c65be',
              600: '#684da7',
              700: '#563e8a',
              800: '#483473',
              900: '#3d2d60',
              950: '#251a3d',
            }
          }
        }
      }
    }
  </script>

  <!-- Alpine.js CDN -->
  <script defer src="https://unpkg.com/alpinejs@3.13.5/dist/cdn.min.js"></script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    body {
      background-color: #0b0f19;
      color: #f3f4f6;
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
    /* Glassmorphism Classes */
    .glass-card {
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .glass-input {
      background: rgba(31, 41, 55, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-input:focus {
      border-color: #9b8bd2;
      background: rgba(31, 41, 55, 0.8);
      box-shadow: 0 0 0 2px rgba(155, 139, 210, 0.2);
    }
  </style>
</head>
<body class="h-full flex overflow-hidden antialiased font-sans" x-data="appState()">

  <!-- Toast Notification System -->
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <template x-for="toast in toasts" :key="toast.id">
      <div 
        x-transition:enter="transition ease-out duration-300 transform translate-y-[-10px] opacity-0"
        x-transition:enter-start="opacity-0 translate-y-[-10px]"
        x-transition:enter-end="opacity-100 translate-y-0"
        x-transition:leave="transition ease-in duration-200 opacity-0 transform translate-x-[10px]"
        class="pointer-events-auto p-4 rounded-xl flex items-start gap-3 shadow-lg w-80 max-w-full border"
        :class="toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/90 border-rose-500/30 text-rose-200'"
      >
        <span class="mt-0.5">
          <template x-if="toast.type === 'success'">
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </template>
          <template x-if="toast.type === 'error'">
            <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </template>
        </span>
        <div class="flex-1">
          <p class="text-sm font-semibold" x-text="toast.title"></p>
          <p class="text-xs mt-0.5 opacity-80" x-text="toast.message"></p>
        </div>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-white transition">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </template>
  </div>

  <!-- Sidebar -->
  <aside class="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#0f1524]">
    <!-- Brand / Title -->
    <div class="p-5 border-b border-slate-800 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
        <i data-lucide="database" class="w-4.5 h-4.5 text-white"></i>
      </div>
      <div>
        <h1 class="font-bold text-sm tracking-wide text-white">HONOLITE</h1>
        <p class="text-[10px] text-slate-400 font-medium tracking-wider uppercase">SQLite Admin Panel</p>
      </div>
    </div>

    <!-- Search Tables -->
    <div class="p-3">
      <div class="relative">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i data-lucide="search" class="h-4 w-4 text-slate-500"></i>
        </span>
        <input 
          type="text" 
          placeholder="Tìm kiếm bảng..." 
          x-model="tableSearchQuery"
          class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg glass-input focus:outline-none text-slate-200 placeholder-slate-500"
        />
      </div>
    </div>

    <!-- Tables List -->
    <div class="flex-1 overflow-y-auto px-2 pb-4">
      <nav class="space-y-0.5">
        <!-- SQL Editor Tab Button -->
        <button 
          @click="selectSQLEditor()"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition duration-200 group"
          :class="isSQLEditorActive ? 'bg-brand-950/80 border border-brand-500/30 text-brand-300' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'"
        >
          <i data-lucide="terminal" class="w-4 h-4 flex-shrink-0" :class="isSQLEditorActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-400'"></i>
          <span class="flex-1 text-left">Trình chạy SQL Console</span>
        </button>

        <div class="h-px bg-slate-800 my-2"></div>

        <p class="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Danh sách bảng</p>

        <template x-for="table in filteredTables" :key="table">
          <button 
            @click="selectTable(table)"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition duration-200 group"
            :class="activeTable === table && !isSQLEditorActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <i data-lucide="table-2" class="w-4 h-4 flex-shrink-0" :class="activeTable === table && !isSQLEditorActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-400'"></i>
              <span class="truncate" x-text="table"></span>
            </div>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </button>
        </template>
      </nav>
    </div>
  </aside>

  <!-- Main View -->
  <main class="flex-1 flex flex-col overflow-hidden bg-[#070a13]">
    <!-- Topbar / Header -->
    <header class="h-16 flex items-center justify-between px-8 border-b border-slate-800/80 bg-[#0c101d]">
      <div class="flex items-center gap-4">
        <template x-if="isSQLEditorActive">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-brand-950 border border-brand-500/20 text-brand-400">
              <i data-lucide="terminal" class="w-4 h-4"></i>
            </span>
            <span class="text-sm font-semibold text-white">SQL Raw Console</span>
          </div>
        </template>
        <template x-if="!isSQLEditorActive && activeTable">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <i data-lucide="table-2" class="w-4 h-4"></i>
            </span>
            <div>
              <span class="text-sm font-semibold text-white" x-text="activeTable"></span>
              <span class="text-xs text-slate-400 ml-2" x-text="'(' + totalRows + ' dòng)'"></span>
            </div>
          </div>
        </template>
      </div>

      <div class="flex items-center gap-3">
        <!-- Read-Only Badge -->
        <template x-if="isReadOnly">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/20">
            <i data-lucide="eye" class="w-3 h-3"></i> Read-Only
          </span>
        </template>
        
        <!-- Refresh Button -->
        <button 
          @click="refreshData()"
          class="flex items-center justify-center p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          title="Tải lại dữ liệu"
        >
          <i data-lucide="refresh-cw" class="w-4 h-4" :class="loading ? 'animate-spin' : ''"></i>
        </button>
      </div>
    </header>

    <!-- Content Workspace -->
    <div class="flex-1 overflow-y-auto p-8 relative">
      <!-- Loading Overlay -->
      <template x-if="loading && !rows.length && !queryResult.rows">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-10">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </template>

      <!-- 1. SQL Editor View -->
      <template x-if="isSQLEditorActive">
        <div class="space-y-6">
          <div class="glass-card rounded-xl overflow-hidden">
            <div class="px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Nhập truy vấn SQL của bạn</span>
              <span class="text-[10px] text-slate-500 font-mono">Hỗ trợ các câu lệnh SQLite tiêu chuẩn</span>
            </div>
            <div class="p-5 space-y-4">
              <textarea 
                x-model="sqlQuery"
                class="w-full h-40 p-4 font-mono text-sm rounded-xl glass-input text-slate-100 focus:outline-none"
                placeholder="SELECT * FROM users LIMIT 10;"
              ></textarea>
              <div class="flex items-center justify-between">
                <button 
                  @click="clearSqlQuery()"
                  class="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Xóa câu lệnh
                </button>
                <button 
                  @click="runSqlQuery()"
                  :disabled="loading || !sqlQuery.trim()"
                  class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs tracking-wide text-white transition flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i> Chạy câu lệnh (Ctrl+Enter)
                </button>
              </div>
            </div>
          </div>

          <!-- Query results -->
          <template x-if="queryResult.rows || queryResult.error || queryResult.affectedRows !== undefined">
            <div class="glass-card rounded-xl overflow-hidden">
              <div class="px-5 py-3.5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-300">Kết quả truy vấn</span>
                <span 
                  class="text-xs text-slate-400" 
                  x-text="queryResult.timeMs !== undefined ? 'Thời gian chạy: ' + queryResult.timeMs + 'ms' : ''"
                ></span>
              </div>
              <div class="p-5">
                <!-- Success Write Alert -->
                <template x-if="queryResult.affectedRows !== undefined && !queryResult.error">
                  <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-sm flex items-center gap-3">
                    <i data-lucide="info" class="w-5 h-5 text-indigo-400"></i>
                    <span>Thành công! Số dòng bị ảnh hưởng: <strong class="text-white font-semibold" x-text="queryResult.affectedRows"></strong> dòng.</span>
                  </div>
                </template>

                <!-- Error Alert -->
                <template x-if="queryResult.error">
                  <div class="p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                      <h4 class="font-bold text-white mb-0.5">Lỗi SQL:</h4>
                      <code class="text-xs font-mono break-all text-rose-200" x-text="queryResult.error"></code>
                    </div>
                  </div>
                </template>

                <!-- Result Table -->
                <template x-if="queryResult.rows && queryResult.rows.length > 0">
                  <div class="overflow-x-auto border border-slate-800 rounded-lg">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="bg-slate-900 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
                          <template x-for="col in queryResult.columns" :key="col">
                            <th class="px-4 py-3" x-text="col"></th>
                          </template>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/60">
                        <template x-for="(row, idx) in queryResult.rows" :key="idx">
                          <tr class="hover:bg-slate-900/30 transition">
                            <template x-for="col in queryResult.columns" :key="col">
                              <td class="px-4 py-2.5 font-mono text-slate-300 break-words max-w-xs" x-text="formatCellValue(row[col])"></td>
                            </template>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </template>

                <!-- Empty Results -->
                <template x-if="queryResult.rows && queryResult.rows.length === 0 && queryResult.affectedRows === undefined && !queryResult.error">
                  <div class="py-8 text-center text-slate-500 text-xs">
                    Truy vấn không trả về dòng dữ liệu nào.
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- 2. Table Detail View -->
      <template x-if="!isSQLEditorActive && activeTable">
        <div class="space-y-6" x-init="$nextTick(() => { lucide.createIcons(); })">
          <!-- View Tab Selector -->
          <div class="flex border-b border-slate-800/80 gap-6">
            <button 
              @click="activeTab = 'browse'" 
              class="pb-3 text-xs font-semibold tracking-wide border-b-2 transition duration-200 flex items-center gap-2"
              :class="activeTab === 'browse' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'"
            >
              <i data-lucide="eye" class="w-4 h-4"></i> Duyệt Dữ Liệu
            </button>
            <button 
              @click="activeTab = 'schema'" 
              class="pb-3 text-xs font-semibold tracking-wide border-b-2 transition duration-200 flex items-center gap-2"
              :class="activeTab === 'schema' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'"
            >
              <i data-lucide="info" class="w-4 h-4"></i> Cấu Trúc Bảng
            </button>
          </div>

          <!-- Browse Tab -->
          <div x-show="activeTab === 'browse'" class="space-y-4">
            <!-- Search & Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <!-- Search inside table -->
              <div class="relative w-full sm:w-72">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-lucide="search" class="h-4 w-4 text-slate-500"></i>
                </span>
                <input 
                  type="text" 
                  placeholder="Tìm trong các cột Text..." 
                  x-model.debounce.500ms="searchQuery"
                  class="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input focus:outline-none text-slate-200 placeholder-slate-500"
                />
              </div>

              <!-- Create record button -->
              <template x-if="!isReadOnly">
                <button 
                  @click="openAddModal()"
                  class="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs font-semibold text-white tracking-wide transition shadow-lg shadow-brand-500/10 flex items-center gap-2"
                >
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Thêm Dòng Mới
                </button>
              </template>
            </div>

            <!-- Data Table Grid -->
            <div class="glass-card rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <!-- Operations column header -->
                      <template x-if="!isReadOnly">
                        <th class="px-5 py-3.5 w-24 text-center">Thao tác</th>
                      </template>
                      <template x-for="col in schema.columns" :key="col.name">
                        <th class="px-5 py-3.5 font-semibold">
                          <div class="flex items-center gap-1">
                            <span class="text-slate-200" x-text="col.name"></span>
                            <span class="text-[9px] text-slate-500 normal-case" x-text="col.type"></span>
                            <template x-if="col.primaryKey">
                              <span class="px-1 text-[8px] bg-brand-950 text-brand-300 border border-brand-500/20 rounded font-bold">PK</span>
                            </template>
                          </div>
                        </th>
                      </template>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/50">
                    <template x-for="(row, idx) in rows" :key="idx">
                      <tr class="hover:bg-slate-900/30 transition">
                        <!-- Operations column cells -->
                        <template x-if="!isReadOnly">
                          <td class="px-5 py-3 w-24 text-center">
                            <div class="flex items-center justify-center gap-2.5">
                              <button @click="openEditModal(row)" class="text-slate-400 hover:text-brand-400 transition" title="Sửa">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                              </button>
                              <button @click="openDeleteModal(row)" class="text-slate-400 hover:text-rose-400 transition" title="Xóa">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                              </button>
                            </div>
                          </td>
                        </template>
                        <template x-for="col in schema.columns" :key="col.name">
                          <td class="px-5 py-3 font-mono text-slate-300 break-words max-w-xs" x-text="formatCellValue(row[col.name])"></td>
                        </template>
                      </tr>
                    </template>

                    <!-- Empty Data Row -->
                    <template x-if="rows.length === 0">
                      <tr>
                        <td :colspan="schema.columns.length + (isReadOnly ? 0 : 1)" class="py-12 text-center text-slate-500">
                          Bảng hiện không có dữ liệu nào phù hợp.
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Pagination Info and Actions -->
              <div class="px-5 py-4 border-t border-slate-800/80 bg-slate-900/10 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-400">
                <div>
                  Hiển thị từ <strong class="text-slate-200" x-text="((page - 1) * limit) + 1"></strong> 
                  đến <strong class="text-slate-200" x-text="Math.min(page * limit, totalRows)"></strong> 
                  trong tổng số <strong class="text-slate-200" x-text="totalRows"></strong> dòng.
                </div>
                
                <div class="flex items-center gap-4">
                  <!-- Rows per page selector -->
                  <div class="flex items-center gap-2">
                    <span>Số dòng:</span>
                    <select x-model="limit" class="px-2 py-1 rounded-md glass-input focus:outline-none text-slate-300">
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>

                  <!-- Pagination Controls -->
                  <div class="flex items-center gap-1.5">
                    <button 
                      @click="prevPage()"
                      :disabled="page <= 1"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-300"
                    >
                      <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
                    </button>
                    <span class="px-2 font-medium" x-text="'Trang ' + page + ' / ' + Math.ceil(totalRows / limit)"></span>
                    <button 
                      @click="nextPage()"
                      :disabled="page >= Math.ceil(totalRows / limit)"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-300"
                    >
                      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Schema Tab -->
          <div x-show="activeTab === 'schema'" class="space-y-6">
            <div class="glass-card rounded-xl overflow-hidden">
              <div class="px-5 py-3 border-b border-slate-800 bg-slate-900/30">
                <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wide">Cấu trúc các cột</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th class="px-5 py-3.5">Cột</th>
                      <th class="px-5 py-3.5">Kiểu dữ liệu</th>
                      <th class="px-5 py-3.5">Thuộc tính</th>
                      <th class="px-5 py-3.5">Giá trị mặc định</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/50">
                    <template x-for="col in schema.columns" :key="col.name">
                      <tr class="hover:bg-slate-900/30 transition">
                        <td class="px-5 py-3 font-semibold text-slate-200">
                          <div class="flex items-center gap-2">
                            <span x-text="col.name"></span>
                            <template x-if="col.primaryKey">
                              <span class="px-1.5 py-0.5 text-[8px] bg-brand-950 text-brand-300 border border-brand-500/20 rounded font-bold uppercase">Primary Key</span>
                            </template>
                          </div>
                        </td>
                        <td class="px-5 py-3 font-mono text-xs text-brand-300" x-text="col.type || 'INTEGER/TEXT/BLOB'"></td>
                        <td class="px-5 py-3 text-slate-400">
                          <span class="px-1.5 py-0.5 rounded text-[10px] border border-slate-800" :class="col.notNull ? 'bg-rose-950/20 text-rose-400 border-rose-500/10' : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/10'" x-text="col.notNull ? 'NOT NULL' : 'NULLABLE'"></span>
                        </td>
                        <td class="px-5 py-3 font-mono text-slate-400" x-text="col.defaultValue !== null ? col.defaultValue : 'NULL'"></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Foreign Keys Section -->
            <template x-if="schema.foreignKeys && schema.foreignKeys.length > 0">
              <div class="glass-card rounded-xl overflow-hidden">
                <div class="px-5 py-3 border-b border-slate-800 bg-slate-900/30">
                  <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wide">Khóa ngoại (Foreign Keys)</h3>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th class="px-5 py-3.5">Cột tham chiếu</th>
                        <th class="px-5 py-3.5">Bảng đích</th>
                        <th class="px-5 py-3.5">Cột đích</th>
                        <th class="px-5 py-3.5">On Update / Delete</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                      <template x-for="fk in schema.foreignKeys" :key="fk.id + '-' + fk.seq">
                        <tr class="hover:bg-slate-900/30 transition text-slate-300">
                          <td class="px-5 py-3 font-mono font-semibold" x-text="fk.from"></td>
                          <td class="px-5 py-3 text-slate-200" x-text="fk.table"></td>
                          <td class="px-5 py-3 font-mono" x-text="fk.to"></td>
                          <td class="px-5 py-3 text-slate-400 font-mono text-[10px]" x-text="'ON UPDATE: ' + fk.onUpdate + ' | ON DELETE: ' + fk.onDelete"></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- 3. Welcome / Empty Screen -->
      <template x-if="!isSQLEditorActive && !activeTable">
        <div class="h-96 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center shadow-2xl mb-5 text-brand-400 animate-pulse">
            <i data-lucide="database" class="w-8 h-8"></i>
          </div>
          <h2 class="text-lg font-bold text-white">Chào mừng tới trang quản trị SQLite</h2>
          <p class="text-sm text-slate-400 mt-2 max-w-sm">Chọn một bảng từ thanh bên để xem cấu trúc và dữ liệu, hoặc sử dụng SQL Console để truy vấn.</p>
        </div>
      </template>
    </div>
  </main>

  <!-- CRUD Modals -->

  <!-- Add Record Modal -->
  <div 
    x-show="addModalOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    x-transition
    style="display: none;"
  >
    <div @click.outside="closeAddModal()" class="w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <i data-lucide="plus-circle" class="w-4 h-4 text-brand-400"></i> Thêm dòng dữ liệu mới
        </h3>
        <button @click="closeAddModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <form @submit.prevent="submitAddForm()" class="p-6 space-y-4">
        <div class="max-h-96 overflow-y-auto space-y-4 pr-1">
          <template x-for="col in schema.columns" :key="col.name">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300">
                <span x-text="col.name"></span>
                <span class="text-[10px] text-slate-500 ml-1 font-mono" x-text="'(' + (col.type || 'TEXT') + ')'"></span>
                <template x-if="col.primaryKey">
                  <span class="text-[9px] text-brand-400 font-bold ml-1">PK</span>
                </template>
                <template x-if="col.notNull">
                  <span class="text-rose-500 ml-0.5">*</span>
                </template>
              </label>

              <!-- Inputs dynamically generated -->
              <input 
                type="text" 
                x-model="formData[col.name]" 
                :placeholder="col.primaryKey ? 'Tự động tạo (nếu tự tăng)' : 'Nhập giá trị...'"
                :disabled="col.primaryKey"
                class="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-200 focus:outline-none disabled:opacity-40"
              />
            </div>
          </template>
        </div>
        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="closeAddModal()" 
            class="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-xs text-white transition shadow-lg shadow-brand-500/20"
          >
            Thêm dòng
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit Record Modal -->
  <div 
    x-show="editModalOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    x-transition
    style="display: none;"
  >
    <div @click.outside="closeEditModal()" class="w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <i data-lucide="edit-3" class="w-4 h-4 text-brand-400"></i> Cập nhật thông tin dòng
        </h3>
        <button @click="closeEditModal()" class="text-slate-400 hover:text-white transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <form @submit.prevent="submitEditForm()" class="p-6 space-y-4">
        <div class="max-h-96 overflow-y-auto space-y-4 pr-1">
          <template x-for="col in schema.columns" :key="col.name">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300">
                <span x-text="col.name"></span>
                <span class="text-[10px] text-slate-500 ml-1 font-mono" x-text="'(' + (col.type || 'TEXT') + ')'"></span>
                <template x-if="col.primaryKey">
                  <span class="text-[9px] text-brand-400 font-bold ml-1">PK (Khóa)</span>
                </template>
                <template x-if="col.notNull">
                  <span class="text-rose-500 ml-0.5">*</span>
                </template>
              </label>

              <!-- Inputs -->
              <input 
                type="text" 
                x-model="formData[col.name]" 
                :disabled="col.primaryKey"
                class="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-200 focus:outline-none disabled:opacity-40"
              />
            </div>
          </template>
        </div>
        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="closeEditModal()" 
            class="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-xs text-white transition shadow-lg shadow-brand-500/20"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Record Confirmation Modal -->
  <div 
    x-show="deleteModalOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    x-transition
    style="display: none;"
  >
    <div @click.outside="closeDeleteModal()" class="w-full max-w-sm glass-card rounded-2xl overflow-hidden shadow-2xl border-rose-500/20">
      <div class="p-6 text-center space-y-4">
        <div class="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-2">
          <i data-lucide="alert-triangle" class="w-6 h-6"></i>
        </div>
        <h3 class="text-sm font-bold text-white">Xác nhận xóa dữ liệu</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa dòng dữ liệu đang chọn khỏi cơ sở dữ liệu?</p>
        
        <div class="flex items-center justify-center gap-3 pt-2">
          <button 
            type="button" 
            @click="closeDeleteModal()" 
            class="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Hủy bỏ
          </button>
          <button 
            type="button" 
            @click="submitDelete()" 
            class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-xs text-white transition"
          >
            Chắc chắn xóa
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Script logics -->
  <script>
    function appState() {
      return {
        basePath: '${cleanedBasePath}',
        tables: [],
        tableSearchQuery: '',
        activeTable: null,
        isSQLEditorActive: false,
        activeTab: 'browse',
        
        // Data states
        schema: { columns: [], foreignKeys: [] },
        rows: [],
        totalRows: 0,
        page: 1,
        limit: 10,
        searchQuery: '',
        loading: false,
        isReadOnly: false,

        // SQL Editor state
        sqlQuery: '',
        queryResult: { rows: null, columns: [], error: null },

        // CRUD Modals and form state
        addModalOpen: false,
        editModalOpen: false,
        deleteModalOpen: false,
        formData: {},
        selectedRow: null, // Used for edit/delete reference

        // Toasts
        toasts: [],

        init() {
          this.fetchTables();
          // Event listener for Ctrl+Enter in SQL Editor
          window.addEventListener('keydown', (e) => {
            if (this.isSQLEditorActive && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              this.runSqlQuery();
            }
          });
          
          this.$watch('searchQuery', () => {
            if (this.activeTable) {
              this.page = 1;
              this.fetchTableData();
            }
          });

          this.$watch('limit', () => {
            if (this.activeTable) {
              this.page = 1;
              this.fetchTableData();
            }
          });
          
          this.$nextTick(() => {
            lucide.createIcons();
          });
        },

        get filteredTables() {
          if (!this.tableSearchQuery.trim()) return this.tables;
          const query = this.tableSearchQuery.toLowerCase();
          return this.tables.filter(t => t.toLowerCase().includes(query));
        },

        // Toast notifications
        showToast(title, message, type = 'success') {
          const id = Date.now();
          this.toasts.push({ id, title, message, type });
          setTimeout(() => {
            this.removeToast(id);
          }, 4000);
        },

        removeToast(id) {
          this.toasts = this.toasts.filter(t => t.id !== id);
        },

        // API calls
        async fetchTables() {
          this.loading = true;
          try {
            const res = await fetch(\`\${this.basePath}/api/tables\`);
            const data = await res.json();
            if (data.success) {
              this.tables = data.tables;
              this.isReadOnly = data.readOnly;
            } else {
              this.showToast('Lỗi tải bảng', data.error || 'Không rõ lý do', 'error');
            }
          } catch (err) {
            this.showToast('Lỗi mạng', err.message, 'error');
          } finally {
            this.loading = false;
            this.$nextTick(() => { lucide.createIcons(); });
          }
        },

        async fetchTableData() {
          if (!this.activeTable) return;
          this.loading = true;
          try {
            const url = \`\${this.basePath}/api/tables/\${encodeURIComponent(this.activeTable)}?page=\${this.page}&limit=\${this.limit}&search=\${encodeURIComponent(this.searchQuery)}\`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
              this.schema = data.info;
              this.rows = data.rows;
              this.totalRows = data.total;
            } else {
              this.showToast('Lỗi dữ liệu', data.error, 'error');
            }
          } catch (err) {
            this.showToast('Lỗi mạng', err.message, 'error');
          } finally {
            this.loading = false;
            this.$nextTick(() => { lucide.createIcons(); });
          }
        },

        selectTable(table) {
          this.isSQLEditorActive = false;
          this.activeTable = table;
          this.page = 1;
          this.searchQuery = '';
          this.activeTab = 'browse';
          this.queryResult = { rows: null, columns: [], error: null };
          this.fetchTableData();
        },

        selectSQLEditor() {
          this.isSQLEditorActive = true;
          this.activeTable = null;
          this.$nextTick(() => { lucide.createIcons(); });
        },

        refreshData() {
          if (this.isSQLEditorActive) {
            if (this.sqlQuery.trim()) this.runSqlQuery();
          } else if (this.activeTable) {
            this.fetchTableData();
          } else {
            this.fetchTables();
          }
        },

        prevPage() {
          if (this.page > 1) {
            this.page--;
            this.fetchTableData();
          }
        },

        nextPage() {
          if (this.page < Math.ceil(this.totalRows / this.limit)) {
            this.page++;
            this.fetchTableData();
          }
        },

        formatCellValue(val) {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'object') return JSON.stringify(val);
          return val.toString();
        },

        // SQL Query methods
        async runSqlQuery() {
          if (!this.sqlQuery.trim()) return;
          this.loading = true;
          const startTime = performance.now();
          try {
            const res = await fetch(\`\${this.basePath}/api/query\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sql: this.sqlQuery })
            });
            const data = await res.json();
            const timeMs = Math.round(performance.now() - startTime);
            
            if (data.success) {
              this.queryResult = {
                rows: data.rows || null,
                columns: data.columns || [],
                affectedRows: data.affectedRows,
                error: null,
                timeMs
              };
              this.showToast('Truy vấn hoàn thành', \`Thành công sau \${timeMs}ms\`);
              // Reload sidebar if a write happened
              if (data.affectedRows !== undefined) {
                this.fetchTables();
              }
            } else {
              this.queryResult = {
                rows: null,
                columns: [],
                error: data.error,
                timeMs
              };
              this.showToast('Lỗi truy vấn', 'Vui lòng kiểm tra lại câu lệnh', 'error');
            }
          } catch (err) {
            this.queryResult = { rows: null, columns: [], error: err.message, timeMs: 0 };
            this.showToast('Lỗi kết nối', err.message, 'error');
          } finally {
            this.loading = false;
            this.$nextTick(() => { lucide.createIcons(); });
          }
        },

        clearSqlQuery() {
          this.sqlQuery = '';
          this.queryResult = { rows: null, columns: [], error: null };
        },

        // CRUD UI Actions
        openAddModal() {
          if (this.isReadOnly) return;
          this.formData = {};
          // Initialize empty values matching schema
          this.schema.columns.forEach(col => {
            this.formData[col.name] = '';
          });
          this.addModalOpen = true;
          this.$nextTick(() => { lucide.createIcons(); });
        },

        closeAddModal() {
          this.addModalOpen = false;
        },

        async submitAddForm() {
          this.loading = true;
          // Filter primary key column from payload if empty (to let SQLite autoincrement work)
          const payload = {};
          this.schema.columns.forEach(col => {
            const val = this.formData[col.name];
            if (col.primaryKey && (val === '' || val === null || val === undefined)) {
              // Skip primary keys to let database autoincrement them
              return;
            }
            
            // Type conversion basics
            if (val === '') {
              payload[col.name] = col.notNull ? '' : null;
            } else if (col.type && (col.type.toUpperCase().includes('INT') || col.type.toUpperCase().includes('NUM'))) {
              payload[col.name] = val.includes('.') ? parseFloat(val) : parseInt(val, 10);
            } else {
              payload[col.name] = val;
            }
          });

          try {
            const res = await fetch(\`\${this.basePath}/api/tables/\${encodeURIComponent(this.activeTable)}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: payload })
            });
            const data = await res.json();
            if (data.success) {
              this.showToast('Thành công', 'Đã thêm 1 dòng dữ liệu mới');
              this.closeAddModal();
              this.fetchTableData();
            } else {
              this.showToast('Lỗi ghi dữ liệu', data.error, 'error');
            }
          } catch (err) {
            this.showToast('Lỗi kết nối', err.message, 'error');
          } finally {
            this.loading = false;
          }
        },

        openEditModal(row) {
          if (this.isReadOnly) return;
          this.selectedRow = row;
          this.formData = { ...row };
          this.editModalOpen = true;
          this.$nextTick(() => { lucide.createIcons(); });
        },

        closeEditModal() {
          this.editModalOpen = false;
          this.selectedRow = null;
        },

        async submitEditForm() {
          this.loading = true;
          
          // Separate PK and update values
          const pk = {};
          const updateData = {};
          
          this.schema.columns.forEach(col => {
            const currentVal = this.formData[col.name];
            
            // Parse numerical columns
            let finalVal = currentVal;
            if (currentVal !== '' && currentVal !== null && currentVal !== undefined) {
              if (col.type && (col.type.toUpperCase().includes('INT') || col.type.toUpperCase().includes('NUM'))) {
                finalVal = currentVal.toString().includes('.') ? parseFloat(currentVal) : parseInt(currentVal, 10);
              }
            } else {
              finalVal = col.notNull ? '' : null;
            }

            if (col.primaryKey) {
              // PK criteria remains unchanged from selected row
              pk[col.name] = this.selectedRow[col.name];
            } else {
              updateData[col.name] = finalVal;
            }
          });

          // If table has no defined PK, use the entire selected row as identification criteria
          if (Object.keys(pk).length === 0) {
            Object.assign(pk, this.selectedRow);
          }

          try {
            const res = await fetch(\`\${this.basePath}/api/tables/\${encodeURIComponent(this.activeTable)}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pk, data: updateData })
            });
            const data = await res.json();
            if (data.success) {
              this.showToast('Thành công', 'Đã lưu các thay đổi');
              this.closeEditModal();
              this.fetchTableData();
            } else {
              this.showToast('Lỗi cập nhật', data.error, 'error');
            }
          } catch (err) {
            this.showToast('Lỗi kết nối', err.message, 'error');
          } finally {
            this.loading = false;
          }
        },

        openDeleteModal(row) {
          if (this.isReadOnly) return;
          this.selectedRow = row;
          this.deleteModalOpen = true;
          this.$nextTick(() => { lucide.createIcons(); });
        },

        closeDeleteModal() {
          this.deleteModalOpen = false;
          this.selectedRow = null;
        },

        async submitDelete() {
          this.loading = true;
          
          // Formulate primary key identifier
          const pk = {};
          this.schema.columns.forEach(col => {
            if (col.primaryKey) {
              pk[col.name] = this.selectedRow[col.name];
            }
          });

          // If no PK, use whole row
          if (Object.keys(pk).length === 0) {
            Object.assign(pk, this.selectedRow);
          }

          try {
            const res = await fetch(\`\${this.basePath}/api/tables/\${encodeURIComponent(this.activeTable)}\`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pk })
            });
            const data = await res.json();
            if (data.success) {
              this.showToast('Đã xóa', 'Dòng dữ liệu đã được gỡ bỏ khỏi bảng');
              this.closeDeleteModal();
              this.fetchTableData();
            } else {
              this.showToast('Lỗi xóa', data.error, 'error');
            }
          } catch (err) {
            this.showToast('Lỗi kết nối', err.message, 'error');
          } finally {
            this.loading = false;
          }
        }
      };
    }
  </script>
</body>
</html>`;
}
